'use strict';

      const DEFAULT_PORTFOLIOS = [
        {'name': 'Market ETFs', 'symbols': ['SPY', 'DIA', 'QQQ', 'IWM']},
        {'name': 'Sector ETFs', 'symbols': ['XLF', 'XLK', 'XLC', 'XLV', 'XLP', 'XLY', 'XLE', 'XLB', 'XLI', 'XLU', 'XLRE']},
        {'name': 'Banks', 'symbols': ['GS', 'MS', 'JPM', 'WFC', 'C', 'BAC']},
        {'name': 'Tech', 'symbols': ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'FB', 'TWTR', 'NFLX', 'SNAP', 'PINS', 'ABNB', 'UBER', 'LYFT', 'DASH', 'SPOT', 'SQ', 'PTON', 'HOOD', 'NVDA', 'INTC']},
        {'name': 'Cryptos', 'symbols': ['BTCUSDT', 'ETHUSDT']},
        {'name': 'Other ETFs', 'symbols': ['VOO', 'VTI', 'VXUS', 'VGK', 'VPL', 'VWO', 'BND', 'IEF', 'TLT', 'HYG']},
        {'name': 'Other', 'symbols': ['XOM', 'WMT', 'JNJ', 'BA', 'T', 'DIS', 'MCD', 'PG', 'TSLA']}
      ];

      // register for a token at https://iexcloud.io/
      const API_TOKEN = 'pk_939cc506f2ca43bb90da88fe5cf59fa4';

      if (API_TOKEN === 'YOUR_TOKEN_HERE') {
        alert('You need to register for a token at https://iexcloud.io/');
      }

      const PORTFOLIOS = portfoliosFromQueryParams() || DEFAULT_PORTFOLIOS;
      const REFRESH_SECONDS = 10;
      const BATCH_SIZE = 100;
      const BASE_URL = 'https://cloud.iexapis.com/stable/stock/market/batch';
      const FAVICON_SYMBOL = 'SPY';
      const FAVICON_BASE_URL = 'https://d3v3cbxkdlyonc.cloudfront.net/stocks';

      let symbols = [FAVICON_SYMBOL];
      let containerDiv = document.querySelector('.stocks-container');


      PORTFOLIOS.forEach((p, i) => addPortfolio(p, i === 0));
      symbols = symbols.filter((s, i) => symbols.indexOf(s) === i);
      updateData('addTitle');
      setInterval(updateData, REFRESH_SECONDS * 1000);

      function addPortfolio(portfolio, includeHeader) {
        let tableHeaderHtml = '';
        if (includeHeader) {
          tableHeaderHtml = `
            <thead>
              <tr>
                <th></th>
                <th class="stock-price">Last</th>
                <th class="stock-change">Change</th>
                <th class="stock-change-pct">Change%</th>
                <th class="stock-mkt-cap">Mkt Cap</th>
              </tr>
            </thead>
          `
        }

        let tableBodyHtml = portfolio.symbols.map(symbol => {
          symbol = symbol.toUpperCase();
          symbols.push(symbol);

          let html = `
            <tr data-symbol="${symbol}">
              <td class="stock-symbol"><a href="${symbolUrl(symbol)}" target="_blank">${symbol}</a></td>
              <td class="stock-price"></td>
              <td class="stock-change"></td>
              <td class="stock-change-pct"></td>
              <td class="stock-mkt-cap"></td>
            </tr>
          `

          return html;
        }).join('');

        let portfolioDiv = document.createElement('div');

        portfolioDiv.innerHTML = `
          <details open>
            <summary><h2>${portfolio.name}</h2></summary>
            <table>${tableHeaderHtml}<tbody>${tableBodyHtml}</tbody></table>
          </details>
        `;

        containerDiv.appendChild(portfolioDiv);
      }

      function updateData(addTitle) {
        let numberOfBatches = Math.ceil(symbols.length / BATCH_SIZE);

        for (let i = 0; i < numberOfBatches; i++) {
          let symbolsBatch = symbols.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
          updateDataForBatch(symbolsBatch, addTitle);
        }


      }

      function updateDataForBatch(symbols, addTitle) {
        let filters = ['latestPrice', 'change', 'changePercent', 'marketCap'];
        if (addTitle) filters.push('companyName');
        let url = `${BASE_URL}?types=quote&symbols=${symbols.join(',')}&filter=${filters.join(',')}&token=${API_TOKEN}`;

        fetch(url).then(response => response.json()).then(json => {
          symbols.forEach(symbol => {
            let data = json[symbol];
            if (typeof(data) === 'undefined' || !data.quote.latestPrice) return;

            let formattedPrice = formatQuote(Number(data.quote.latestPrice));
            let formattedChange = formatChange(data.quote.change);
            let formattedChangePercent = formatChangePercent(data.quote.changePercent);
            let formattedMarketCap = formatMarketCap(data.quote.marketCap);
            let bgColorStyle = calculateBgColorStyle(data.quote.changePercent)

            document.querySelectorAll(`[data-symbol="${symbol}"] .stock-price`).forEach(e => {
              e.innerHTML = formattedPrice;
              e.setAttribute('style', bgColorStyle);
            });

            document.querySelectorAll(`[data-symbol="${symbol}"] .stock-change`).forEach(e => {
              e.innerHTML = formattedChange;
              e.setAttribute('style', bgColorStyle);
            });

            document.querySelectorAll(`[data-symbol="${symbol}"] .stock-change-pct`).forEach(e => {
              e.innerHTML = formattedChangePercent;
              e.setAttribute('style', bgColorStyle);
            });

            document.querySelectorAll(`[data-symbol="${symbol}"] .stock-mkt-cap`).forEach(e => {
              e.innerHTML = formattedMarketCap;
              e.setAttribute('style', bgColorStyle);
            });

            if (addTitle) {
              document.querySelectorAll(`[data-symbol="${symbol}"] .stock-symbol a`).forEach(e => {
                e.setAttribute('title', data.quote.companyName);
              });
            }

            if (symbol === FAVICON_SYMBOL) {
              updateFavicon(data.quote);
            }
          });
        });
      }

      function portfoliosFromQueryParams() {
        if (!window.location.search) return;

        let params = new URLSearchParams(window.location.search);
        let portfolios = [];

        for (let p of params) {
          portfolios.push({'name': p[0], 'symbols': p[1].split(',')});
        }

        return portfolios;
      }

      function symbolUrl(symbol) {
        return `https://finance.yahoo.com/quote/${symbol}`;
      }

      function formatChange(value) {
        if (value === null || value === undefined) return '';
        return value.toLocaleString('en', {'minimumFractionDigits': 2});
      }

      function formatChangePercent(value) {
        if (value === null || value === undefined) return '';
        return (value * 100).toFixed(1) + '%';
      }

      function formatQuote(value) {
        let options = {
          'minimumFractionDigits': 2,
          'style': 'currency',
          'currency': 'USD'
        };
        return value.toLocaleString('en', options);
      }

      function formatMarketCap(marketCap) {
        if (marketCap === null || marketCap === 0 || marketCap === undefined) return '';

        let value, suffix;
        if (marketCap >= 1e12) {
          value = marketCap / 1e12;
          suffix = 'T';
        } else if (marketCap >= 1e9) {
          value = marketCap / 1e9;
          suffix = 'B';
        } else {
          value = marketCap / 1e6;
          suffix = 'M';
        }

        let digits = value < 10 ? 1 : 0;

        return '$' + value.toFixed(digits) + suffix;
      }

      function calculateBgColorStyle(changePercent) {
        if (changePercent === undefined) return '';

        let rgbColor = changePercent > 0 ? '0,255,0' : '255,0,0';
        let rgbOpacity = Math.min(Math.abs(changePercent) * 20, 1);

        return `background-color: rgba(${rgbColor}, ${rgbOpacity})`;
      }

      function updateFavicon(quote) {
        let favicon = document.querySelector('link[rel="icon"]');
        let path = quote.change < 0 ? 'favicon_down.ico' : 'favicon.ico';
        let href = `${FAVICON_BASE_URL}/${path}`;

        if (favicon.getAttribute('href') !== href) {
          favicon.setAttribute('href', href);
        }
      }