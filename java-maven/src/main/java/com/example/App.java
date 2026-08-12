package com.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class App {

    private static final Logger LOGGER = LogManager.getLogger(App.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static Map<String, Object> parse(String json) throws Exception {
        return MAPPER.readValue(json, Map.class);
    }

    public static void main(String[] args) throws Exception {
        LOGGER.info("parsed {}", parse("{\"status\":\"ok\"}"));
    }
}
