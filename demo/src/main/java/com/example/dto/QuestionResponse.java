package com.example.dto;

import java.util.List;

public class QuestionResponse {
    private Long id;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    private String question;
    private List<String> answers;
    private String desc;
    private String status;

    public QuestionResponse(Long id,String question, List<String> answers, String desc, String status) {
        this.question = question;
        this.answers = answers;
        this.desc = desc;
        this.status = status;
        this.id =id;
    }

    public String getQuestion() { return question; }
    public List<String> getAnswers() { return answers; }
    public String getDesc() { return desc; }
    public String getStatus() { return status; }

    @Override
    public String toString() {
        return "QuestionResponse{" +
                "question='" + question + '\'' +
                ", answers=" + answers +
                ", desc='" + desc + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}