package com.example.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

@TableName("question_bank")
public class QuestionEntry {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String bankName;

    private String question;

    private String answers;

    private String description;

    private String status;

    private Integer sortOrder;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getAnswers() { return answers; }
    public void setAnswers(String answers) { this.answers = answers; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    @Override
    public String toString() {
        return "QuestionEntry{" +
                "id=" + id +
                ", bankName='" + bankName + '\'' +
                ", question='" + question + '\'' +
                ", answers='" + answers + '\'' +
                ", description='" + description + '\'' +
                ", status='" + status + '\'' +
                ", sortOrder=" + sortOrder +
                '}';
    }
}