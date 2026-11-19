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
            "and user_id = #{userId} ORDER BY id ASC")
    List<QuestionEntry> selectByBankNameAndUserId(@Param("bankName") String bankName, Long userId);

    @Select("SELECT bank_name FROM question_bank where user_id=#{userId} or user_id=0\n" +
            "GROUP BY bank_name\n" +
            "ORDER BY MIN(id)")
    List<String> selectAllBankName(Long userId);
    @Select("""
            select * from  question_bank where id = #{id} and user_id = #{userId}
            """)
    QuestionEntry selectOneByIdAndUserId(Long id, Long userId);
}