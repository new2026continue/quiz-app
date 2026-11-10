package com.example.service;

import com.example.dto.LoginRequest;
import com.example.dto.RegisterRequest;
import com.example.entity.AppUser;
import com.example.mapper.AppUserMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final AppUserMapper appUserMapper;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(AppUserMapper appUserMapper) {
        this.appUserMapper = appUserMapper;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public void register(RegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new IllegalArgumentException("username 不能为空");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("password 不能为空");
        }
        if (request.getPassword().length() < 6) {
            throw new IllegalArgumentException("password 长度不能少于 6 位");
        }
        if (appUserMapper.selectByUsername(request.getUsername()) != null) {
            throw new IllegalArgumentException("用户名已存在");
        }
        AppUser user = new AppUser();
        user.setUsername(request.getUsername());
        String pwd = passwordEncoder.encode(request.getPassword());
        user.setPasswordHash(pwd);
        user.setCreatedAt(LocalDateTime.now());
        appUserMapper.insert(user);
    }
    public Long login(LoginRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new IllegalArgumentException("username 不能为空");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("password 不能为空");
        }
        AppUser user = appUserMapper.selectByUsername(request.getUsername());
        if (user == null) {
            throw new IllegalArgumentException("用户名或密码错误");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("用户名或密码错误");
        }
        return user.getId();
    }

    public AppUser getUserById(Long id) {
        return appUserMapper.selectById(id);
    }
}