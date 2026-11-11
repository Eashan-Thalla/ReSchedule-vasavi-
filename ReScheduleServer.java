import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * ReSchedule - Java HTTP & REST API Server
 * 
 * Disruption-Recovery Production Scheduling for MSME Job Shops
 * Team: Quantum Leapers
 * Institution: Gokaraju Lailavathi Engineering College
 * Theme: Smart Automation
 * 
 * How to compile & run:
 *   javac ReScheduleServer.java
 *   java ReScheduleServer
 * Or with Java 11+:
 *   java ReScheduleServer.java
 */
public class ReScheduleServer {
    private static final int PORT = 8080;
    private static final String BASE_DIR = ".";

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // 1. Static Web Frontend Handler (serves index.html, css, js)
        server.createContext("/", new StaticFileHandler());

        // 2. REST API Handlers for future backend integration
        server.createContext("/api/health", new HealthHandler());
        server.createContext("/api/jobs", new JobsApiHandler());
        server.createContext("/api/machines", new MachinesApiHandler());
        server.createContext("/api/recovery", new RecoveryApiHandler());
        server.createContext("/api/benchmark", new BenchmarkApiHandler());

        server.setExecutor(null); // default executor
        server.start();

        System.out.println("==================================================================");
        System.out.println("  ReSchedule | Intelligent Manufacturing Recovery System");
        System.out.println("  Powered by Team Quantum Leapers");
        System.out.println("  Gokaraju Lailavathi Engineering College (Theme: Smart Automation)");
        System.out.println("==================================================================");
        System.out.println("  [OK] Server running at: http://localhost:" + PORT);
        System.out.println("  [OK] Open http://localhost:" + PORT + " in your browser to view ReSchedule!");
        System.out.println("  [OK] REST API endpoints available at http://localhost:" + PORT + "/api/*");
        System.out.println("==================================================================");
    }

    /**
     * Serves static frontend files (HTML, CSS, JS) with appropriate MIME types.
     */
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String pathStr = exchange.getRequestURI().getPath();
            if (pathStr.equals("/") || pathStr.isEmpty()) {
                pathStr = "/index.html";
            }

            Path filePath = Paths.get(BASE_DIR, pathStr).normalize();
            File file = filePath.toFile();

            if (!file.exists() || file.isDirectory()) {
                String notFound = "404 Not Found - ReSchedule";
                exchange.sendResponseHeaders(404, notFound.length());
                OutputStream os = exchange.getResponseBody();
                os.write(notFound.getBytes(StandardCharsets.UTF_8));
                os.close();
                return;
            }

            String mimeType = getMimeType(filePath.toString());
            exchange.getResponseHeaders().set("Content-Type", mimeType);
            exchange.sendResponseHeaders(200, file.length());

            OutputStream os = exchange.getResponseBody();
            Files.copy(filePath, os);
            os.close();
        }

        private String getMimeType(String path) {
            if (path.endsWith(".html")) return "text/html; charset=UTF-8";
            if (path.endsWith(".css")) return "text/css; charset=UTF-8";
            if (path.endsWith(".js")) return "application/javascript; charset=UTF-8";
            if (path.endsWith(".json")) return "application/json; charset=UTF-8";
            if (path.endsWith(".svg")) return "image/svg+xml";
            if (path.endsWith(".png")) return "image/png";
            return "text/plain; charset=UTF-8";
        }
    }

    /**
     * Health check endpoint
     */
    static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String json = "{\"status\":\"healthy\",\"system\":\"ReSchedule\",\"team\":\"Quantum Leapers\"}";
            sendJsonResponse(exchange, json);
        }
    }

    /**
     * Jobs API mock handler
     */
    static class JobsApiHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String json = "{\"status\":\"success\",\"totalJobs\":10,\"onTimeTarget\":\"87.5%\"}";
            sendJsonResponse(exchange, json);
        }
    }

    /**
     * Machines API mock handler
     */
    static class MachinesApiHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String json = "{\"status\":\"success\",\"totalMachines\":13,\"breakdownCount\":1,\"fleetUtilization\":\"72.8%\"}";
            sendJsonResponse(exchange, json);
        }
    }

    /**
     * Intelligent Recovery Solver endpoint
     */
    static class RecoveryApiHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String json = "{\"status\":\"success\",\"algorithm\":\"ReSchedule\","
                    + "\"computationTimeMs\":2340,\"rescheduledJobs\":3,\"changedAssignments\":2,"
                    + "\"predictedOnTimeDelivery\":94.2,\"scheduleStabilityIndex\":91.5}";
            sendJsonResponse(exchange, json);
        }
    }

    /**
     * Benchmark Comparison endpoint
     */
    static class BenchmarkApiHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String json = "{\"algorithms\":[\"FCFS\",\"EDD\",\"CP-SAT\",\"ReSchedule\"],"
                    + "\"rescheduleOnTime\":94.8,\"cpsatOnTime\":88.5,\"eddOnTime\":76.8,\"fcfsOnTime\":64.2}";
            sendJsonResponse(exchange, json);
        }
    }

    private static void sendJsonResponse(HttpExchange exchange, String json) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(200, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }
}

