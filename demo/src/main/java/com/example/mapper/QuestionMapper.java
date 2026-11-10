package com.example.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.entity.QuestionEntry;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface QuestionMapper extends BaseMapper<QuestionEntry> {


    @Select("SELECT * FROM question_bank WHERE bank_name = #{bankName} " +
            "ORDER BY id ASC")
    List<QuestionEntry> selectByBank(@Param("bankName") String bankName);

    @Select("SELECT bank_name FROM question_bank\n" +
            "GROUP BY bank_name\n" +
            "ORDER BY MIN(id)")
    List<String> selectAllBankNames();
}