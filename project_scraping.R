library(rvest)
library(openxlsx)

teacher_number <- numeric()
room <- character()
# ログイン状態のセッションを作る ------------------------------------------------------------
dummy_user_agent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'
login_page <- session("https://ic.ss.senshu-u.ac.jp/login", httr::user_agent(dummy_user_agent))

login_form <- html_form(login_page)[[1]] %>% 
  set_values(username="ne231097", password="****")

session <- submit_form(login_page, login_form)
# ログイン状態でスクレイピング ----------------------------------------------------
search_session <- session %>% 
  session_jump_to("https://ic.ss.senshu-u.ac.jp/lms/lecture/search")
#'/html/body/div[1]/div[2]/div[1]/div[2]/div[1]/div/div[3]/div/div[2]/div[number]/div[1]/div[3]'
#教員番号の入手
search_form <- search_session %>% 
  html_form() 
search_form <- search_form[[1]] %>% 
  set_values(deptLevel1=111)
n_teacherInDpt <-
  search_session %>%
  session_submit(search_form) %>% 
  html_node(xpath='/html/body/div[1]/div[2]/div[1]/div[2]/div[1]/div/div[2]/label') %>%
  html_text %>% 
  readr::parse_number()
n_teacherInDpt
#全体で1162人くらい（2025/04/28時点）
#文学部は200名以上いる
dpt_number <- c(95:111)
position_number <- c(1:9,98)
for (j in dpt_number) {
  for (k in position_number) {
    #学部の教員数
    search_form <- search_session %>% 
      html_form() 
    search_form <- search_form[[1]] %>% 
      set_values(deptLevel1=j, positionCd=k)
    n_teacherInDpt <-
      search_session %>%
      submit_form(search_form) %>% 
      html_node(xpath='/html/body/div[1]/div[2]/div[1]/div[2]/div[1]/div/div[2]/label') %>%
      html_text %>% 
      readr::parse_number()
    Sys.sleep(0.1)
    if(n_teacherInDpt == 0){
    }else{
      for (i in 1:n_teacherInDpt) {
        xpath_t <- paste0('/html/body/div[1]/div[2]/div[1]/div[2]/div[1]/div/div[3]/div/div[2]/div[',
                          i,
                          ']/div[1]/div[3]')
        teacher_number_i <-
          search_session %>%
          submit_form(search_form) %>% 
          html_node(xpath=xpath_t) %>%
          html_text
        teacher_number <- c(teacher_number, teacher_number_i)
        Sys.sleep(0.1)
      }
    }
  }
}
write.csv(teacher_number, "teacher_number_v01.csv")
teacher_number <- read.csv("teacher_number.csv")
nteacher_number <- na.omit(teacher_number)
NROW(nteacher_number)
#授業使用教室の入手
html_base_front <- "https://ic.ss.senshu-u.ac.jp/lms/lecture/table?number="
html_base_back <- "&userNumber=&userName=&selectedLevel1=95&searchLevelCode2=&searchLevelCode3=&searchLevelCode4=&searchLevelCode5=&positionCd="
for (i in 1:NROW(nteacher_number)) {
  url <- paste0(html_base_front,
                nteacher_number[i],
                html_base_back)
  dom <- session %>%
    session_jump_to(url) %>% 
    read_html
  Sys.sleep(0.1)
  for (j in 1:5) {
    ct <- j
    for (k in 1:5){
      dow <- k
      url_room <- paste0('/html/body/div[1]/div[2]/div[1]/div[2]/form[1]/div[3]/div[',
                          ct+1,
                          ']/div[',
                          dow+1,
                          ']/div[1]/div[2]/div/div[1]/span')
      room_i <- html_elements(dom, xpath=url_room) %>% 
        html_text
      if(identical(room_i, character(0))){
      }else{
      cdroom_i <- c(room_i, ct, dow)
      room <- rbind(room, cdroom_i)
      }
    }
  }
}
colnames(room) <- c("教室", "時限", "曜日")
View(room)
write.csv(room, "room_v01.csv")

#水曜2限/html/body/div[1]/div[2]/div[1]/div[2]/form[1]/div[3]/div[3]/div[4]/div/div[2]/div/div[1]/span
#水曜4限/html/body/div[1]/div[2]/div[1]/div[2]/form[1]/div[3]/div[5]/div[4]/div/div[2]/div/div[1]/span
#木曜4限/html/body/div[1]/div[2]/div[1]/div[2]/form[1]/div[3]/div[5]/div[5]/div/div[2]/div/div[1]/span
#DoW曜n限/html/body/div[1]/div[2]/div[1]/div[2]/form[1]/div[3]/div[(n+1)]/div[(DoW+1)]/div/div[2]/div/div[1]/span
#授業２つ/html/body/div[1]/div[2]/div[1]/div[2]/form[1]/div[3]/div[3]/div[3]/div[1]/div[2]/div/div[1]/span
library(dplyr)
df <- data.frame(room)
df %>% filter(教室=="ゼミ１０５Ｆ")
View(df)
df <- read.csv("room_v01.csv")
df %>% filter(stringr::str_detect(教室, ".*１０５Ｆ.*"))
df %>% filter(stringr::str_detect(教室, ".*２２６.*"))
df %>% filter(stringr::str_detect(教室, ".*８２１.*"))
#空いているだけ探し
library(dplyr)
dfn <- distinct(df, 教室, keep_all = FALSE)
View(dfn)
NROW(dfn)
roomf <- c()
roomf <- cbind(roomf,dfn$教室)
for (i in 1:25) {
  roomf <- cbind(roomf,rep(0, NROW(roomf)))
}
colnames(roomf) <- c("教室", "月1", "月2", "月3", "月4", "月5",
                     "火1","火2","火3","火4","火5",
                     "水1","水2","水3","水4","水5",
                     "木1","木2","木3","木4","木5",
                     "金1","金2","金3","金4","金5")
dff <- data.frame(roomf)
for (i in 1:NROW(df)) {
  where <- which(roomf == df[i,2])
  time <- 1 + df[i,3] + (df[i,4]-1)*5
  roomf[where,time] <- 1
}
View(roomf)
write.csv(roomf, "roomf_v01.csv")

