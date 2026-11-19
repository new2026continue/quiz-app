package com.example.service;

import com.example.dto.QuestionRequest;
import com.example.dto.QuestionResponse;
import com.example.entity.AppUser;
import com.example.entity.QuestionEntry;
import com.example.mapper.AppUserMapper;
import com.example.mapper.QuestionMapper;
import org.springframework.stereotype.Service;

import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuestionService {
    private final AppUserMapper appUserMapper;
    private final QuestionMapper questionMapper;
    private final ObjectMapper objectMapper;
    public QuestionService(AppUserMapper appUserMapper, QuestionMapper questionMapper, ObjectMapper objectMapper) {
        this.appUserMapper = appUserMapper;
        this.questionMapper = questionMapper;
        this.objectMapper = objectMapper;

    }
    public List<QuestionResponse> findRawEntries(String bankName, String username) {//shift+f6
        AppUser user = appUserMapper.selectByUsername(username);
        Long userId = 0L;
        if (user != null && !"common".equals(bankName)) {
           userId = user.getId();
        }

        List<QuestionEntry> entries = questionMapper.selectByBankNameAndUserId(bankName, userId);
        List<QuestionResponse> result = new ArrayList<>();
        for(QuestionEntry entry: entries){
           result.add(toDto(entry));
        }

        return result;
    }
    public QuestionResponse findOneQuestionById(Long id){
        QuestionEntry entry = questionMapper.selectById(id);
        if (entry == null) {
            return null;
        }
        return toDto(entry);
    }

    private QuestionResponse toDto(QuestionEntry entry) {
        List<String> answers;
        try {
            answers = objectMapper.readValue(
                    entry.getAnswers(),
                    new TypeReference<List<String>>() {}
            );
        } catch (JacksonException e) {
            throw new RuntimeException("解析 answers 失败，id=" + entry.getId(), e);
        }


        return new QuestionResponse(
                entry.getId(),
                entry.getQuestion(),
                answers,
                entry.getDescription()
        );
    }
    public QuestionResponse createOne(QuestionRequest request) {
        if (request.getBankName() == null || request.getBankName().isBlank()) {
            throw new IllegalArgumentException("bankName 不能为空");
        }
        if (request.getQuestion() == null || request.getQuestion().isBlank()) {
            throw new IllegalArgumentException("question 不能为空");
        }

        if (request.getAnswers() == null) {
            request.setAnswers(new ArrayList<>());
        }

        String answersJson;
        try {
            answersJson = objectMapper.writeValueAsString(request.getAnswers());
        } catch (JacksonException e) {
            throw new RuntimeException("序列化 answers 失败，question=" + request.getQuestion(), e);
        }

        QuestionEntry entry = new QuestionEntry();
        entry.setBankName(request.getBankName());
        entry.setQuestion(request.getQuestion());
        entry.setAnswers(answersJson);
        entry.setDescription(request.getDesc());
        String username = request.getUsername();
        Long userId = 0L;
        if(username!=null && !"common".equals(request.getBankName())){
           userId= appUserMapper.selectByUsername(username).getId();
        }
       entry.setUserId(userId);

        questionMapper.insert(entry);

        return toDto(entry);
    }

    public List<String> getAllBankNameByUsername(String username) {
        AppUser user = appUserMapper.selectByUsername(username);
        Long id = 0L;
        if (user != null) {
            id = user.getId();
        }
        return questionMapper.selectAllBankName(id);
    }
    public boolean removeQuestion(Long id) {
        QuestionEntry entry = questionMapper.selectById(id);
        if (entry == null) {
            return false;
        }
        return questionMapper.deleteById(id) > 0;
    }

        public QuestionResponse modfiyQuestion(Long id, QuestionRequest request) {
            QuestionEntry entry = questionMapper.selectById(id);
            if (entry == null) {
                return null;
            }

            if (request.getBankName() != null && !request.getBankName().isBlank()) {
                entry.setBankName(request.getBankName());
            }
            if (request.getQuestion() != null && !request.getQuestion().isBlank()) {
                entry.setQuestion(request.getQuestion());
            }
            if (request.getDesc() != null) {
                entry.setDescription(request.getDesc());
            }

            if (request.getAnswers() != null) {
                try {
                    entry.setAnswers(objectMapper.writeValueAsString(request.getAnswers()));
                } catch (JacksonException e) {
                    throw new RuntimeException("序列化 answers 失败，id=" + id, e);
                }
            }

            questionMapper.updateById(entry);

            return toDto(entry);

    }
}