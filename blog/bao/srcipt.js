
        const api ="https://newsdata.io/api/1/latest?apikey=pub_b8549296c96f46938e5c3b092b857088&q=vn";
        let newsData = [];

        async function loadweb(){
            const box = document.getElementById("new");
            box.innerHTML = `<div class="no-news">Đang tải tin tức...</div>`;
            try{
                const res = await fetch(api);
                const data = await res.json();

                // Xử lý trường hợp rate limit hoặc lỗi API
                if(data.status === "error" && data.code === "RateLimitExceeded"){
                    box.innerHTML = `<div class="no-news">
                        API đã đạt giới hạn. Vui lòng đợi 5 phút rồi thử lại.<br>
                        <small>${data.results.message}</small>
                    </div>`;
                    return;
                }

                newsData = data.results || [];
                displayNews(newsData);

                // Khởi tạo AOS sau khi DOM đã được tạo xong
                AOS.init({
                    duration: 800,
                    easing: 'ease-in-out',
                    once: true,
                });

            } catch (err) {
                console.log("Lỗi API:", err);
                box.innerHTML = `<div class="no-news">Không tìm thấy tin tức. Vui lòng thử lại sau.</div>`;
            }
        }

        function displayNews(dataArray){
            const box = document.getElementById("new");
            box.innerHTML = "";

            if(!dataArray || dataArray.length === 0){
                box.innerHTML = `<div class="no-news">Không tìm thấy tin tức.</div>`;
                return;
            }

            for(let i = 0; i < dataArray.length; i++){
                const item = dataArray[i];
                const div = document.createElement("div");
                div.classList.add("new", "card");
                div.setAttribute("data-aos", "fade-up");

                if(item.image_url){
                    div.innerHTML += `<img src="${item.image_url}" alt="Ảnh tin tức">`;
                }
                div.innerHTML += `<h2>${item.title}</h2>`;
                div.innerHTML += `<p><strong>Mô tả:</strong> ${item.description || "Không có mô tả."}</p>`;
                div.innerHTML += `<p><strong>Nội dung:</strong> ${item.content || "Không có nội dung."}</p>`;

                div.innerHTML += `
                  <div class="source">
                    Nguồn: <a href="${item.source_url}" target="_blank">${item.source_name || "Không rõ"}</a> |
                    <a href="${item.link}" target="_blank">Đọc bài gốc</a>
                  </div>
                `;

                box.appendChild(div);
            }
        }

        function filterNews(){
            const keyword = document.getElementById("searchInput").value.toLowerCase();
            const filtered = newsData.filter(item => 
                (item.title && item.title.toLowerCase().includes(keyword)) ||
                (item.description && item.description.toLowerCase().includes(keyword)) ||
                (item.content && item.content.toLowerCase().includes(keyword))
            );
            displayNews(filtered);
        }

        loadweb();
