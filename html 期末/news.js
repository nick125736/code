function getNews() {
    var country = document.getElementById("country").value;
    var category = document.getElementById("category").value;
    var sort = document.getElementById("sort").value;
    var cardContainer = document.getElementById("cardContainer");

    cardContainer.innerHTML = '';


    var apiUrl = 'https://newsapi.org/v2/top-headlines?' +
          'country=' + country + '&' +
          'category=' + category + '&' +
          'sort=' + sort + '&' +
          'apiKey=0a69cb0c042049ab8b0ac2fe9bed405c';


    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {

            console.log(data);

            var articles = data.articles;
            var cardCount = Math.min(articles.length, 50);
            var row = document.createElement("div"); // 创建新的行容器
            row.className = "row";
    
            for (var i = 0; i < cardCount; i++) {
                var article = articles[i];
                var card = createCard(article);

                row.appendChild(card);
                if ((i + 1) % 3 === 0 || i === cardCount - 1) {
                    cardContainer.appendChild(row); // 添加当前行到容器中
                    row = document.createElement("div"); // 创建新的行容器
                    row.className = "row";
                }
                cardContainer.appendChild(card);
            }
        })
        .catch(error => {
            console.log('發生錯誤：', error);
        });

        console.log()
    
        // 創建單個字卡的函數
        function createCard(article) {
          var card = document.createElement("div");
          card.className = "card";
    
          var image = document.createElement("img");
          image.src = article.urlToImage;
          card.appendChild(image);
    
          var title = document.createElement("h2");
          title.textContent = article.title;
          card.appendChild(title);
    
          var description = document.createElement("p");
          description.textContent = article.description;
          card.appendChild(description);
    
          var content = document.createElement("p");
          content.textContent = article.content;
          card.appendChild(content);
    
          var link = document.createElement("a");
          link.href = article.url;
          link.textContent = "閱讀更多";
          card.appendChild(link);
    
          return card;
        }
}