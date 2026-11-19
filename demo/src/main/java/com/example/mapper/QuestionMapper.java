package com.example.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.entity.QuestionEntry;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface QuestionMapper extends BaseMapper<QuestionEntry> {

    /**
     * 按题库名 + 用户 id 查词条
     * - 私有题库：user_id = 当前用户
     * - 公共题库：user_id = 0
     */
    @Select("SELECT * FROM question_bank " +
            "WHERE bank_name = #{bankName} AND user_id = #{userId} " +
            "ORDER BY id ASC")
    List<QuestionEntry> selectByBankNameAndUserId(
            @Param("bankName") String bankName,
            @Param("userId") Long userId);

    /**
     * 查某用户可见的题库名列表（自己的 + 公共的）
     */
    @Select("SELECT bank_name FROM question_bank " +
            "WHERE user_id = #{userId} OR user_id = 0 " +
            "GROUP BY bank_name " +
            "ORDER BY MIN(id)")
    List<String> selectAllBankName(@Param("userId") Long userId);

    /**
     * 按 id + 用户 id 查单条
     * 用于“只能改/删自己的”校验；公共题库 user_id = 0，普通用户匹配不上，自然只读
     */
    @Select("SELECT * FROM question_bank " +
            "WHERE id = #{id} AND user_id = #{userId}")
    QuestionEntry selectOneByIdAndUserId(
            @Param("id") Long id,
            @Param("userId") Long userId);
}