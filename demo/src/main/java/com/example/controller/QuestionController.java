package com.example.controller;

import com.example.dto.QuestionRequest;
import com.example.dto.QuestionResponse;
import com.example.service.QuestionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/api/v1/questions")
@RestController
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    /**
     * 取当前登录用户 id；未登录返回 0（只能看公共题库）
     */
    private Long getUserIdOrZero(HttpSession session) {
        Object v = session.getAttribute("userId");
        return v == null ? 0L : (Long) v;
    }

    /**
     * 要求必须登录，未登录抛 401
     */
    private Long requireUserId(HttpSession session) {
        Object v = session.getAttribute("userId");
        if (v == null) {
            throw new IllegalArgumentException("未登录");
        }
        return (Long) v;
    }

    @GetMapping("/banks")
    public List<String> getBanks(HttpSession session) {
        return questionService.getAllBankNames(getUserIdOrZero(session));
    }

    @GetMapping
    public List<QuestionResponse> list(@RequestParam(required = false) String bank,
                                       HttpSession session) {
        return questionService.findRawEntries(bank, getUserIdOrZero(session));
    }

    @GetMapping("/{id}")
    public QuestionResponse one(@PathVariable("id") Long id) {
        return questionService.findOneQuestionById(id);
    }

    @PostMapping
    public QuestionResponse postOne(@RequestBody QuestionRequest questionRequest,
                                    HttpSession session) {
        return questionService.createOne(questionRequest, requireUserId(session));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpSession session) {
        Long userId = requireUserId(session);
        if(userId==1L) {
            userId =0L;
        }
        boolean deleted = questionService.removeQuestion(id, userId);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuestionResponse> update(@PathVariable Long id,
                                                   @RequestBody QuestionRequest request,
                                                   HttpSession session) {
        Long userId = requireUserId(session);
        if(userId==1L) {
            userId =0L;
        }
        QuestionResponse updated = questionService.modfiyQuestion(id, request, userId);
        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(updated);
    }
}