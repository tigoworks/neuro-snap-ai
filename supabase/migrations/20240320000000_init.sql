-- 1. 启用 UUID 生成扩展
create extension if not exists "pgcrypto";


-- 2. 用户基础表：存储第 2 部分"用户信息填写"字段
create table public.user_survey (
  id uuid primary key default gen_random_uuid(),  -- 主键：唯一用户提交 ID
  name text not null,                             -- 姓名
  gender text check (gender in ('male','female','unknown')) default 'unknown',  -- 性别
  age integer check (age > 0),                    -- 年龄
  city text,                                      -- 城市（例如：南京）
  occupation text,                                -- 职业
  education text,                                 -- 学历（本科/硕士/博士）
  phone text,                                     -- 手机号（可选）
  submit_time timestamptz default now()           -- 提交时间（带时区）
);


-- 3. 测评模型表：存放各模块（fiveq、mbti、big5、disc、holland、motivation）
create table public.survey_model (
  id uuid primary key default gen_random_uuid(),  -- 模型 ID
  code text unique not null,                      -- 模型编码（如：fiveq、mbti、big5、disc、holland、motivation）
  name text not null,                             -- 模型名称（中文或英文）
  description text,                               -- 模型描述（可选）
  created_at timestamptz default now()            -- 创建时间
);


-- 4. 测评题库表：存放所有题目及其"编号→选项文字"映射
create table public.survey_question (
  id uuid primary key default gen_random_uuid(),  -- 题目 ID
  model_id uuid not null references survey_model(id),  -- 外键：所属模型
  question_code text not null,                    -- 题目编码（如：fiveq_q1、mbti_ei_q1、big5_o_q1、disc_d_q1、holland_r_q1、motivation_q1）
  content text not null,                          -- 题干文字
  options jsonb,                                  -- "编号→文字"映射的 JSON 数组，例如：
                                                  -- [
                                                  --   {"code":1,"label":"选项A"},
                                                  --   {"code":2,"label":"选项B"},
                                                  --   {"code":3,"label":"选项C"},
                                                  --   {"code":4,"label":"选项D"}
                                                  -- ]
                                                  -- 开放文本题（type='text'）可留 NULL 或空数组
  type text check (type in ('single','multiple','scale','text','sorting')) not null default 'single',
                                                  -- 题型：  
                                                  --   'single'：单选（前端只会返回 {"choice":code}）  
                                                  --   'multiple'：多选（返回 {"choices":[code,...]}）  
                                                  --   'scale'：打分 1~5（返回 {"score":X}）  
                                                  --   'text'：开放填空（返回 {"text":"用户输入"}）  
                                                  --   'sorting'：拖拽排序（返回 {"order":[code,...]}）  
  sort_order integer default 0,                   -- 同模型下排序优先级
  required boolean default true                   -- 是否必答
);


-- 5. 用户回答表：只存编号（code），后续可通过 survey_question.options 映射到文字
create table public.user_survey_answer (
  id uuid primary key default gen_random_uuid(),  -- 回答记录 ID
  user_survey_id uuid not null references user_survey(id),  -- 外键：对应哪位用户
  question_id uuid not null references survey_question(id),-- 外键：哪道题
  model_id uuid not null references survey_model(id),       -- 外键：对应哪个模型（同 q.model_id 冗余）
  answer jsonb not null,                          -- 存编号的 JSON，例如：
                                                  --   单选：{"choice":2}  
                                                  --   多选：{"choices":[1,3]}  
                                                  --   打分：{"score":4}  
                                                  --   文本：{"text":"我的回答"}  
                                                  --   拖拽：{"order":[3,1,2,4]}  
  created_at timestamptz default now()           -- 回答时间
);


-- 6. 测试结果表：存储所有测试的最终结果
create table public.test_results (
  id uuid primary key default gen_random_uuid(),  -- 主键：唯一测试结果 ID
  user_info jsonb not null,                       -- 用户信息（姓名、性别、年龄等）
  five_questions jsonb not null,                  -- 五问法结果
  mbti_result jsonb not null,                     -- MBTI 结果
  big5_result jsonb not null,                     -- 五大人格结果
  disc_result jsonb not null,                     -- DISC 结果
  holland_result jsonb not null,                  -- 霍兰德结果
  values_result jsonb not null,                   -- 价值观结果
  created_at timestamptz default now()            -- 创建时间
);


--------------------------------------------------------------------------------
-- 以下示例演示如何插入"带编号→文字映射"的选项，方便前端渲染与后续分析
--------------------------------------------------------------------------------

-- 先插入各模型元数据
insert into public.survey_model(code, name, description) values
  ('fiveq',     '五问法快速画像',       '5 个开放+选择题，获取主观信息'),
  ('mbti',      'MBTI 简化测试',        '4 维度×2 道题'),
  ('big5',      '五大人格（Big5）',     '5 维度×2 道题打分'),
  ('disc',      'DISC 行为风格',        '4 维度×2 道题判断行为倾向'),
  ('holland',   '霍兰德职业兴趣（RIASEC）','6 维度×2 道题打分'),
  ('motivation','动机与价值观测试',     '6 道题：多选/排序/文本混合');


-- 五问法示例题（前 2 题为开放文本，后 3 题为单选或多选）
insert into public.survey_question(model_id, question_code, content, options, type, sort_order) values
  ((select id from public.survey_model where code='fiveq'), 
   'fiveq_q1', '你当前最关注的问题是什么？', 
   null, 'text', 1),
  ((select id from public.survey_model where code='fiveq'), 
   'fiveq_q2', '最近有没有学什么新东西？', 
   null, 'text', 2),
  ((select id from public.survey_model where code='fiveq'), 
   'fiveq_q3', '遇到压力时，你通常怎么应对？', 
   '[
     {"code":1,"label":"寻找他人帮助"},
     {"code":2,"label":"运动锻炼"},
     {"code":3,"label":"独自思考"},
     {"code":4,"label":"逃避"}
   ]'::jsonb, 'single', 3),
  ((select id from public.survey_model where code='fiveq'), 
   'fiveq_q4', '你五年后的期望状态是什么？', 
   null, 'text', 4),
  ((select id from public.survey_model where code='fiveq'), 
   'fiveq_q5', '你最欣赏什么样的人？', 
   '[
     {"code":1,"label":"乐观积极"},
     {"code":2,"label":"坚定果断"},
     {"code":3,"label":"富有同理心"},
     {"code":4,"label":"创造力强"}
   ]'::jsonb, 'multiple', 5);


-- MBTI 简化测试示例题（每维度两题，均为单选）
insert into public.survey_question(model_id, question_code, content, options, type, sort_order) values
  ((select id from public.survey_model where code='mbti'),
   'mbti_ei_q1', '在聚会中，你更喜欢：', 
   '[
     {"code":1,"label":"与大多数人交谈"},
     {"code":2,"label":"与几位好友深入交谈"}
   ]'::jsonb, 'single', 1),
  ((select id from public.survey_model where code='mbti'),
   'mbti_ei_q2', '休息时，你更倾向于：', 
   '[
     {"code":1,"label":"外出活动"},
     {"code":2,"label":"独处思考"}
   ]'::jsonb, 'single', 2),
  ((select id from public.survey_model where code='mbti'),
   'mbti_sn_q1', '你做决定时更关注：', 
   '[
     {"code":1,"label":"现实细节"},
     {"code":2,"label":"未来可能性"}
   ]'::jsonb, 'single', 3),
  ((select id from public.survey_model where code='mbti'),
   'mbti_sn_q2', '你与人交流时更喜欢：', 
   '[
     {"code":1,"label":"具体事实"},
     {"code":2,"label":"抽象概念"}
   ]'::jsonb, 'single', 4),
  ((select id from public.survey_model where code='mbti'),
   'mbti_tf_q1', '你判断他人更倾向：', 
   '[
     {"code":1,"label":"客观逻辑"},
     {"code":2,"label":"个人情感"}
   ]'::jsonb, 'single', 5),
  ((select id from public.survey_model where code='mbti'),
   'mbti_tf_q2', '你处理冲突时更看重：', 
   '[
     {"code":1,"label":"公正原则"},
     {"code":2,"label":"彼此感受"}
   ]'::jsonb, 'single', 6),
  ((select id from public.survey_model where code='mbti'),
   'mbti_jp_q1', '你喜欢生活更加：', 
   '[
     {"code":1,"label":"有计划"},
     {"code":2,"label":"随性"}
   ]'::jsonb, 'single', 7),
  ((select id from public.survey_model where code='mbti'),
   'mbti_jp_q2', '你完成任务时：', 
   '[
     {"code":1,"label":"先列清单再执行"},
     {"code":2,"label":"看心情再做"}
   ]'::jsonb, 'single', 8);


-- 五大人格示例题（10 题，均为打分 1-5）
-- 打分题 options 可留 NULL，前端只显示滑动组件；后端存 {"score":X}
insert into public.survey_question(model_id, question_code, content, options, type, sort_order) values
  ((select id from public.survey_model where code='big5'),
   'big5_o_q1', '我喜欢尝试新鲜事物。请打分（1-5）', 
   null, 'scale', 1),
  ((select id from public.survey_model where code='big5'),
   'big5_o_q2', '我常常富有想象力。请打分（1-5）', 
   null, 'scale', 2),
  ((select id from public.survey_model where code='big5'),
   'big5_c_q1', '我做事很有条理。请打分（1-5）', 
   null, 'scale', 3),
  ((select id from public.survey_model where code='big5'),
   'big5_c_q2', '我喜欢提前规划。请打分（1-5）', 
   null, 'scale', 4),
  ((select id from public.survey_model where code='big5'),
   'big5_e_q1', '我喜欢与人交往。请打分（1-5）', 
   null, 'scale', 5),
  ((select id from public.survey_model where code='big5'),
   'big5_e_q2', '我在大群体场合很活跃。请打分（1-5）', 
   null, 'scale', 6),
  ((select id from public.survey_model where code='big5'),
   'big5_a_q1', '我乐于助人，关心他人。请打分（1-5）', 
   null, 'scale', 7),
  ((select id from public.survey_model where code='big5'),
   'big5_a_q2', '我容易体谅别人的难处。请打分（1-5）', 
   null, 'scale', 8),
  ((select id from public.survey_model where code='big5'),
   'big5_n_q1', '我容易感到焦虑或压力。请打分（1-5）', 
   null, 'scale', 9),
  ((select id from public.survey_model where code='big5'),
   'big5_n_q2', '我情绪波动较大。请打分（1-5）', 
   null, 'scale', 10);


-- DISC 行为风格示例题（8 题，均为单选）
insert into public.survey_question(model_id, question_code, content, options, type, sort_order) values
  ((select id from public.survey_model where code='disc'),
   'disc_d_q1', '在团队中，我通常会主动承担决策角色。', 
   '[
     {"code":1,"label":"是"},
     {"code":2,"label":"否"}
   ]'::jsonb, 'single', 1),
  ((select id from public.survey_model where code='disc'),
   'disc_d_q2', '遇到目标时我会不惜一切完成它。', 
   '[
     {"code":1,"label":"是"},
     {"code":2,"label":"否"}
   ]'::jsonb, 'single', 2),
  ((select id from public.survey_model where code='disc'),
   'disc_i_q1', '我喜欢与他人互动并激励他们。', 
   '[
     {"code":1,"label":"是"},
     {"code":2,"label":"否"}
   ]'::jsonb, 'single', 3),
  ((select id from public.survey_model where code='disc'),
   'disc_i_q2', '在公共场合，我乐于成为焦点人物。', 
   '[
     {"code":1,"label":"是"},
     {"code":2,"label":"否"}
   ]'::jsonb, 'single', 4),
  ((select id from public.survey_model where code='disc'),
   'disc_s_q1', '我喜欢稳定有序的工作环境。', 
   '[
     {"code":1,"label":"是"},
     {"code":2,"label":"否"}
   ]'::jsonb, 'single', 5),
  ((select id from public.survey_model where code='disc'),
   'disc_s_q2', '我在冲突中倾向于保持平和。', 
   '[
     {"code":1,"label":"是"},
     {"code":2,"label":"否"}
   ]'::jsonb, 'single', 6),
  ((select id from public.survey_model where code='disc'),
   'disc_c_q1', '我做事注重规则与标准。', 
   '[
     {"code":1,"label":"是"},
     {"code":2,"label":"否"}
   ]'::jsonb, 'single', 7),
  ((select id from public.survey_model where code='disc'),
   'disc_c_q2', '我会仔细检查细节以确保无误。', 
   '[
     {"code":1,"label":"是"},
     {"code":2,"label":"否"}
   ]'::jsonb, 'single', 8);


-- 霍兰德职业兴趣示例题（12 题，均为打分 1-5）
insert into public.survey_question(model_id, question_code, content, options, type, sort_order) values
  ((select id from public.survey_model where code='holland'),
   'holland_r_q1', '我喜欢动手操作机械或工具。请打分（1-5）', null, 'scale', 1),
  ((select id from public.survey_model where code='holland'),
   'holland_r_q2', '我喜欢户外工作。请打分（1-5）', null, 'scale', 2),
  ((select id from public.survey_model where code='holland'),
   'holland_i_q1', '我喜欢研究和解决复杂问题。请打分（1-5）', null, 'scale', 3),
  ((select id from public.survey_model where code='holland'),
   'holland_i_q2', '我对科学实验和分析感兴趣。请打分（1-5）', null, 'scale', 4),
  ((select id from public.survey_model where code='holland'),
   'holland_a_q1', '我喜欢艺术创作或设计。请打分（1-5）', null, 'scale', 5),
  ((select id from public.survey_model where code='holland'),
   'holland_a_q2', '我享受音乐、绘画等艺术活动。请打分（1-5）', null, 'scale', 6),
  ((select id from public.survey_model where code='holland'),
   'holland_s_q1', '我喜欢与人沟通并帮助他们。请打分（1-5）', null, 'scale', 7),
  ((select id from public.survey_model where code='holland'),
   'holland_s_q2', '我乐于关怀他人并提供支持。请打分（1-5）', null, 'scale', 8),
  ((select id from public.survey_model where code='holland'),
   'holland_e_q1', '我喜欢领导并激励团队。请打分（1-5）', null, 'scale', 9),
  ((select id from public.survey_model where code='holland'),
   'holland_e_q2', '我善于说服他人。请打分（1-5）', null, 'scale', 10),
  ((select id from public.survey_model where code='holland'),
   'holland_c_q1', '我喜欢处理数字、文件和数据。请打分（1-5）', null, 'scale', 11),
  ((select id from public.survey_model where code='holland'),
   'holland_c_q2', '我喜欢按步骤完成任务，注重细节。请打分（1-5）', null, 'scale', 12);


-- 动机与价值观示例题（6 题，包含多选、排序、单选、文本）
insert into public.survey_question(model_id, question_code, content, options, type, sort_order, required) values
  ((select id from public.survey_model where code='motivation'),
   'motivation_q1', '你的主要驱动力是什么？请多选：', 
   '[
     {"code":1,"label":"成就感"},
     {"code":2,"label":"金钱回报"},
     {"code":3,"label":"社会影响"},
     {"code":4,"label":"稳定安全"},
     {"code":5,"label":"归属感"}
   ]'::jsonb, 'multiple', 1, true),
  ((select id from public.survey_model where code='motivation'),
   'motivation_q2', '以下哪几个价值观对你最重要？请多选：', 
   '[
     {"code":1,"label":"独立自由"},
     {"code":2,"label":"团队合作"},
     {"code":3,"label":"创新创造"},
     {"code":4,"label":"责任担当"},
     {"code":5,"label":"家庭幸福"}
   ]'::jsonb, 'multiple', 2, true),
  ((select id from public.survey_model where code='motivation'),
   'motivation_q3', '请按重要性拖拽排序以下选项：', 
   '[
     {"code":1,"label":"技术精通"},
     {"code":2,"label":"人际关系"},
     {"code":3,"label":"个人成长"},
     {"code":4,"label":"社会贡献"},
     {"code":5,"label":"财务独立"}
   ]'::jsonb, 'sorting', 3, false),
  ((select id from public.survey_model where code='motivation'),
   'motivation_q4', '当面对失败时，你的态度是什么？', 
   '[
     {"code":1,"label":"视为学习机会"},
     {"code":2,"label":"感到沮丧"},
     {"code":3,"label":"寻找他人支持"},
     {"code":4,"label":"放弃该目标"}
   ]'::jsonb, 'single', 4, true),
  ((select id from public.survey_model where code='motivation'),
   'motivation_q5', '你最看重的人生格言是什么？', 
   null, 'text', 5, true),
  ((select id from public.survey_model where code='motivation'),
   'motivation_q6', '你如何描述自己在团队中的角色？', 
   '[
     {"code":1,"label":"领导者"},
     {"code":2,"label":"执行者"},
     {"code":3,"label":"协调者"},
     {"code":4,"label":"支持者"}
   ]'::jsonb, 'single', 6, true);