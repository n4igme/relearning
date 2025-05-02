# relearning
ini web untuk belajar e-learning yang bisa digunakan untuk mahasiswa dan dosen, upload materi, tugas, dan diskusi

# Installation
<blockquote>
docker-compose up -d
</blockquote>

# DB Connect
Assuming your MySQL container is named myapp_db_1 (check with docker ps), run:
<blockquote>
docker cp simpan_mt.sql relearning-db-1:/simpan_mt.sql
docker exec -it relearning-db-1 bash
</blockquote>
Inside the container:
<blockquote>
mysql -u root -p simpan_mt < /simpan_mt.sql
</blockquote>
If simpan_mt.sql is in your project directory:
<blockquote>
docker exec -i relearning-db-1 mysql -u root -proot simpan_mt < ./simpan_mt.sql
</blockquote>