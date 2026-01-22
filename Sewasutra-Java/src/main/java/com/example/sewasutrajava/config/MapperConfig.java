package com.example.demo.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for ModelMapper bean.
 * ModelMapper is used for mapping between entities and DTOs.
 */
@Configuration
public class MapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        // Configure strict matching to avoid unexpected mappings
        modelMapper.getConfiguration().setAmbiguityIgnored(true);
        return modelMapper;
    }
}
