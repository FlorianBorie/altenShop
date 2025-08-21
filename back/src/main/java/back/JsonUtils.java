package back;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * Classe utilitaire pour manipuler des objets JSON simples.
 */
public class JsonUtils {
   public JsonUtils() {
   }

   /**
    * Convertit une chaîne JSON simple en Map<String, String>.
    */
   
   public static Map<String, String> parseJson(String json) {
      Map<String, String> map = new HashMap();
      // Supprime espaces, accolades et guillemets
      json = json.trim().replaceAll("[{}\"]", "");
      String[] var5;
      int var4 = (var5 = json.split(",")).length;

      for(int var3 = 0; var3 < var4; ++var3) {
         String pair = var5[var3];
         if (pair.contains(":")) {
            String[] kv = pair.split(":", 2);
            map.put(kv[0].trim(), kv[1].trim());
         }
      }

      return map;
   }

   /**
    * Convertit une Map<String, String> en chaîne JSON.
    */
   
   public static String mapToJson(Map<String, String> map) {
      StringBuilder sb = new StringBuilder("{");
   // Parcourt toutes les entrées de la Map et les formate en JSON
      map.forEach((k, v) -> {
         sb.append("\"").append(k).append("\":\"").append(v).append("\",");
      });
      if (sb.charAt(sb.length() - 1) == ',') {
         sb.deleteCharAt(sb.length() - 1);
      }

      sb.append("}");
      return sb.toString();
   }
   /**
    * Convertit une liste de Map<String, String> en JSON sous forme de tableau.
    */
   public static String listToJson(List<Map<String, String>> list) {
      StringBuilder sb = new StringBuilder("[");
   // Parcourt chaque Map de la liste et la convertit en JSON
      Iterator var3 = list.iterator();

      while(var3.hasNext()) {
         Map<String, String> m = (Map)var3.next();
         sb.append(mapToJson(m)).append(",");
      }

      if (sb.charAt(sb.length() - 1) == ',') {
         sb.deleteCharAt(sb.length() - 1);
      }

      sb.append("]");
      return sb.toString();
   }
}
