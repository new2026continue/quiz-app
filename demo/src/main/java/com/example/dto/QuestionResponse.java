package com.example.dto;

import java.util.List;

public class QuestionResponse {
    private Long id;
    private String question;
    private List<String> answers;
    private String desc;

    public QuestionResponse(Long id,String question, List<String> answers, String desc)
    {
        this.question = question;
        this.answers = answers;
        this.desc = desc;
        this.id =id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public List<String> getAnswers() {
        return answers;
    }

    public void setAnswers(List<String> answers) {
        this.answers = answers;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }
}