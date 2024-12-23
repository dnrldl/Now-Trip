package com.nowtrip.api.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.responses.ApiResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@OpenAPIDefinition(
        info = @Info(
                title = "NowTrip API",
                version = "1.0",
                description = "NowTrip API 문서"
        )
)
@Configuration
public class SwaggerConfig {
        @Bean
        public OpenAPI customOpenAPI() {
                return new OpenAPI()
                        .components(new Components()
                                .addResponses("400", new ApiResponse().description("Bad Request"))
                                .addResponses("404", new ApiResponse().description("Not Found"))
                                .addResponses("500", new ApiResponse().description("Internal Server Error"))
                        );
        }
}
