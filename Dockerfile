# Используем официальный образ Apache Tomcat
FROM tomcat:9.0

# Удаляем стандартные приложения Tomcat (опционально)
RUN rm -rf /usr/local/tomcat/webapps/ROOT

# Копируем ваш .war файл в папку webapps Tomcat
COPY mowebsite.war /usr/local/tomcat/webapps/ROOT.war

# Открываем порт 8080 (по умолчанию Tomcat использует этот порт)
EXPOSE 8080

# Запускаем Tomcat
CMD ["catalina.sh", "run"]