package com.example.controller;

import com.example.dto.QuestionRequest;
import com.example.dto.QuestionResponse;

import com.example.service.QuestionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.apache.catalina.Session;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RequestMapping("/api/v1/questions")
@RestController
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService)
    {
        this.questionService = questionService;

    }
    @GetMapping("/banks")
    public List<String> getBanks(@RequestParam("username") String username) {

        return questionService.getAllBankNameByUsername(username);
    }
    @GetMapping
    public List<QuestionResponse> list(@RequestParam(required = false) String bank, @RequestParam("username") String username)
    {
        System.out.println(username+'l');
        return questionService.findRawEntries(bank, username);
    }
    @GetMapping("/{id}")
    public QuestionResponse one(@PathVariable("id") Long id){
        return questionService.findOneQuestionById(id);
    }
    @PostMapping
    public QuestionResponse postOne(@RequestBody QuestionRequest questionRequest){

        return questionService.createOne(questionRequest);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {

        boolean deleted = questionService.removeQuestion(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuestionResponse> update(@PathVariable Long id, @RequestBody QuestionRequest request) {
        QuestionResponse updated = questionService.modfiyQuestion(id, request);
        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(updated);
    }
}