package com.example.service;

import com.example.dto.QuestionRequest;
import com.example.dto.QuestionResponse;
import com.example.entity.QuestionEntry;
import com.example.mapper.QuestionMapper;
import org.springframework.stereotype.Service;

import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuestionService {

    private final QuestionMapper questionMapper;
    private final ObjectMapper objectMapper;

    public QuestionService(QuestionMapper questionMapper, ObjectMapper objectMapper) {
        this.questionMapper = questionMapper;
        this.objectMapper = objectMapper;
    }

    /**
     * 按题库名查词条
     * @param bankName 题库名
     * @param userId   当前登录用户 id，未登录传 0
     */
    public List<QuestionResponse> findRawEntries(String bankName, Long userId) {
        // "common" 题库固定查公共数据（user_id = 0）
        Long targetUserId = "common".equals(bankName) ? 0L : userId;

        List<QuestionEntry> entries =
                questionMapper.selectByBankNameAndUserId(bankName, targetUserId);

        List<QuestionResponse> result = new ArrayList<>();
        for (QuestionEntry entry : entries) {
            result.add(toDto(entry));
        }
        return result;
    }

    /**
     * 按 id 查单条（暂未做用户隔离）
     */
    public QuestionResponse findOneQuestionById(Long id) {
        QuestionEntry entry = questionMapper.selectById(id);
        if (entry == null) {
            return null;
        }
        return toDto(entry);
    }

    /**
     * 实体转 DTO：answers 从 JSON 字符串转 List
     */
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

    /**
     * 新增一条词条
     * @param request 请求体
     * @param userId  当前登录用户 id（Controller 从 Session 取，已保证非空）
     */
    public QuestionResponse createOne(QuestionRequest request, Long userId) {
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

        // "common" 题库写入公共数据（user_id = 0），其余写当前用户
        Long targetUserId = "common".equals(request.getBankName()) ? 0L : userId;
        entry.setUserId(targetUserId);

        questionMapper.insert(entry);

        return toDto(entry);
    }

    /**
     * 查某用户可见的题库名列表（自己的 + 公共的）
     */
    public List<String> getAllBankNames(Long userId) {
        return questionMapper.selectAllBankName(userId);
    }

    /**
     * 删除一条，只能删自己的
     */
    public boolean removeQuestion(Long id, Long userId) {
        QuestionEntry entry = questionMapper.selectOneByIdAndUserId(id, userId);
        if (entry == null) {
            return false;
        }
        return questionMapper.deleteById(id) > 0;
    }

    /**
     * 修改一条，只能改自己的
     */
    public QuestionResponse modfiyQuestion(Long id, QuestionRequest request, Long userId) {
        QuestionEntry entry = questionMapper.selectOneByIdAndUserId(id, userId);
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