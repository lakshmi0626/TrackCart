package com.trackcart.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trackcart.dto.AuthRequest;
import com.trackcart.dto.AuthResponse;
import com.trackcart.model.Role;
import com.trackcart.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    void testLoginEndpoint() throws Exception {
        AuthRequest req = new AuthRequest("admin@trackcart.io", "Admin@123");
        AuthResponse mockRes = new AuthResponse("mock-jwt-token-xyz", 1L, "admin@trackcart.io", "Admin", "+123", Role.ADMIN);

        when(authService.login(any(AuthRequest.class))).thenReturn(mockRes);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token-xyz"))
                .andExpect(jsonPath("$.email").value("admin@trackcart.io"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }
}
