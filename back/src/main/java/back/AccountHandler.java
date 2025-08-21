package back;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.util.Map;
import org.mindrot.jbcrypt.BCrypt;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.Date;
import io.jsonwebtoken.security.Keys;
import java.security.Key;

public class AccountHandler implements HttpHandler {
    
    // Connexion à la base de données
    private final Connection connection;
    
    // Clé secrète utilisée pour générer les JWT
    private final String jwtSecret = "uneCleTresLongueDePlusDe32CaracteresPourHS256";

    public AccountHandler(Connection connection) {
        this.connection = connection;
    }
    
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            // Récupération de la méthode HTTP
            String method = exchange.getRequestMethod();
            // Récupération du chemin de la requête 
            String context = exchange.getHttpContext().getPath();
            
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "http://localhost:4200");
                exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            
            // On ne gère que les requêtes POST pour ce handler
            if ("POST".equalsIgnoreCase(method)) {
                if (context.equals("/account")) {
                    // Création d'un compte utilisateur
                    handleCreateAccount(exchange);
                } else if (context.equals("/token")) {
                    // Authentification & génération du token
                    handleLogin(exchange);
                } else {
                    
                    sendResponse(exchange, 404, "{\"error\":\"Route inconnue\"}");
                }
            } else {
                
                sendResponse(exchange, 405, "{\"error\":\"Méthode non autorisée\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            
            sendResponse(exchange, 500, "{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Création d'un compte utilisateur
     */
    private void handleCreateAccount(HttpExchange exchange) throws IOException {
        try {
            // Lecture du corps de la requête
            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            Map<String, String> data = JsonUtils.parseJson(body);

            // Récupération des champs depuis le JSON
            String username = data.get("username");
            String firstname = data.get("firstname");
            String email = data.get("email");
            String password = data.get("password");

            // Vérification que toutes les données sont présentes
            if (username == null || firstname == null || email == null || password == null) {
                sendResponse(exchange, 400, "{\"error\":\"Données manquantes\"}");
                return;
            }

            // Hashage du mot de passe
            String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());

            // Insertion dans la BDD
            try (PreparedStatement stmt = connection.prepareStatement(
                    "INSERT INTO users (username, firstname, email, password) VALUES (?, ?, ?, ?)")) {
                stmt.setString(1, username);
                stmt.setString(2, firstname);
                stmt.setString(3, email);
                stmt.setString(4, hashedPassword);
                stmt.executeUpdate();
            }

            sendResponse(exchange, 201, "{\"message\":\"Compte créé avec succès\"}");
        } catch (SQLException e) {
            sendResponse(exchange, 500, "{\"error\":\"Erreur BDD: " + e.getMessage() + "\"}");
        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 400, "{\"error\":\"Données invalides\"}");
        }
    }

    /**
     * Authentification et génération du JWT
     */
    private void handleLogin(HttpExchange exchange) throws IOException {
        try {
     
            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            Map<String, String> data = JsonUtils.parseJson(body);

            String email = data.get("email");
            String password = data.get("password");

            // Vérification que les champs sont présents
            if (email == null || password == null) {
                sendResponse(exchange, 400, "{\"error\":\"Données manquantes\"}");
                return;
            }

            // Récupération du hash du PWD depuis la BDD
            String storedHash = null;
            try (PreparedStatement stmt = connection.prepareStatement(
                    "SELECT password FROM users WHERE email = ?")) {
                stmt.setString(1, email);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) storedHash = rs.getString("password");
                }
            }

            // Vérification du mot de passe
            if (storedHash == null || !BCrypt.checkpw(password, storedHash)) {
                sendResponse(exchange, 401, "{\"error\":\"Email ou mot de passe incorrect\"}");
                return;
            }

            // Déterminer si l'utilisateur est admin
            boolean isAdmin = "admin@admin.com".equals(email);

           
            String jwtSecret = "uneCleTresLongueDePlusDe32CaracteresPourHS256";
            Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

            // Génération du token JWT
            String token = Jwts.builder()
                    .setSubject(email)
                    .claim("isAdmin", isAdmin)
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                    .signWith(key)  
                    .compact();

            System.out.println("Token généré : " + token);

            // Construction de la réponse JSON
            String response = "{ \"message\": \"Connexion réussie\", \"token\": \"" + token + "\", \"isAdmin\": " + isAdmin + " }";

            sendResponse(exchange, 200, response);

        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\":\"Erreur interne\"}");
        }
    }

    /**
     * Méthode utilitaire pour envoyer une réponse JSON
     */
    private void sendResponse(HttpExchange exchange, int status, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        // Gestion des headers CORS
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "http://localhost:4200");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
       
        // Envoi du code HTTP et du contenu
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}