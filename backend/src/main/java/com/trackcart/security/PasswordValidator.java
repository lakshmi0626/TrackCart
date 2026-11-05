package com.trackcart.security;

import com.trackcart.exception.BadRequestException;
import org.springframework.stereotype.Component;

@Component
public class PasswordValidator {

    public void validatePassword(String password) {
        if (password == null || password.length() < 6) {
            throw new BadRequestException("Password must contain at least 6 characters.");
        }
    }
}
