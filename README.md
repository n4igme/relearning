# relearning
ini web untuk belajar e-learning yang bisa digunakan untuk mahasiswa dan dosen, upload materi, tugas, dan diskusi

# Installation
<blockquote>
docker-compose up -d
</blockquote>

# DB Connect
Assuming your MySQL container is named myapp_db_1 (check with docker ps), run:
<blockquote>
docker cp db_relearning.sql relearning-db-1:/db_relearning.sql
docker exec -it relearning-db-1 bash
</blockquote>
Inside the container:
<blockquote>
mysql -u root -p db_relearning < /db_relearning.sql
</blockquote>
If simpan_mt.sql is in your project directory:
<blockquote>
docker exec -i relearning-db-1 mysql -u root -proot db_relearning < ./db_relearning.sql
</blockquote>
