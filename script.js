        document.addEventListener("DOMContentLoaded", () => {
            const loggedInUser = localStorage.getItem("loggedInUser");
            if (!loggedInUser) {
                alert("Lütfen önce giriş yapın!");
                window.location.href = "index.html";
            } else {
                document.getElementById("username").innerText = loggedInUser;
                loadDataForUser(loggedInUser);
            }
        });

	document.getElementById("calculateButton").addEventListener("click", function () {
	    this.disabled = true; // Butonu geçici olarak devre dışı bırak
	    setTimeout(() => {
	        calculateOptionPrice(); // Opsiyon fiyatını hesapla
	        this.disabled = false; // 100ms sonra butonu tekrar aktif et
	    }, 200);
	});

	function activateOptionDescription() {
	    const descriptionElement = document.getElementById("optionDescription");
	
	    // Eğer opsiyon fiyatı hesaplanmamışsa, uyarı ver
	    if (!document.getElementById("optionPrice").value) {
	        descriptionElement.innerHTML = "Lütfen önce opsiyon fiyatını hesaplayın.";
	        return;
	    }
	
	    // Gerekli değişkenleri al
	    const assetName = document.getElementById("asset").value;
	    const strikePrice = parseFloat(document.getElementById("strike").value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	    const premium = parseFloat(document.getElementById("optionPrice").value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	    const optionType = document.getElementById("optionType").value;

	    // Vade sonu tarihini al ve gg aaaa yyyy formatına çevir
	    const expiryElement = document.getElementById("expiry");
	    let expiryDateFormatted = "belirtilmemiş"; // Varsayılan metin
	
	    if (expiryElement && expiryElement.value) {
	        const expiryDate = new Date(expiryElement.value);
	        const day = expiryDate.getDate().toString().padStart(2, '0'); // Gün (2 haneli)
	        const month = expiryDate.toLocaleString('tr-TR', { month: 'long' }); // Ay (Tam Ad)
	        const year = expiryDate.getFullYear(); // Yıl
	        expiryDateFormatted = `${day} ${month} ${year}`; // "gg aaaa yyyy" formatında
	    }

	    // Temettü tarihi bilgisi
	    const dividendDateInput = document.getElementById("dividendDate");
	    let dividendMessage = "";
	    
	    if (dividendDateInput && dividendDateInput.value) {
	        const dividendDate = new Date(dividendDateInput.value);
	        const expiryDate = new Date(expiryElement.value);
	        const today = new Date();
		const dividend = parseFloat(document.getElementById("dividend").value)
	        if (expiryDate < dividendDate) {
	            dividendMessage = `Beklenen temettü tarihi opsiyonun vade tarihinden sonra olduğu için <b>temettü</b> bu opsiyonun fiyatlamasını <b>etkilememektedir.</b><br>`;
	        } else if (dividend === 0) {
	            dividendMessage = `Bu hissede beklenen bir <b>temettü</b> yoktur, opsiyon fiyatlaması buna göre yapılmıştır.<br>`;
	        } else {
	            dividendMessage = `Bu hissede <b>opsiyon fiyatını etkileyen</b> bir tarihte beklenen bir <b>temettü</b> vardır, lütfen yatırımcının bunun farkında olduğundan emin olunuz.<br>`;
	        }
	    }

	    // Dayanak varlığa göre fiyat türünü belirleyelim
	    let priceType;
	    if (assetName.toUpperCase() === "XU030") {
	        priceType = "endeks değeri";
	    } else if (assetName.toUpperCase() === "USDTRY") {
	        priceType = "döviz kuru";
	    } else {
	        priceType = "hisse fiyatı";
	    }
				

	    // Başabaş fiyatını hesapla
	    const breakeven = optionType === "Call" 
	        ? (parseFloat(strikePrice) + parseFloat(premium)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") 
	        : (parseFloat(strikePrice) - parseFloat(premium)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	
	    // Senaryoları oluştur
	    const scenario1 = `
	        <b style="color: red;">Senaryo 1:</b><br>
	        Eğer <b>${assetName}</b> ${priceType} <b>${expiryDateFormatted}</b> tarihinde <b>${strikePrice} TL</b> fiyatından 
	        ${optionType === "Call" ? "düşük" : "yüksek"} ise yatırımcı <b>${premium} TL</b> kadar net kar elde eder.
	    `;
		
	    const scenario2 = `
	        <b style="color: red;">Senaryo 2:</b><br>
	        Eğer <b>${assetName}</b> ${priceType} <b>${expiryDateFormatted}</b> tarihinde <b>${breakeven} TL</b> ile <b>${strikePrice} TL</b> 
	        arasında ise yatırımcı başta elde ettiği <b>${premium} TL</b> opsiyon priminden aradaki fark kadar olan kısmını kaybeder.
	    `;
		
	    const scenario3 = `
	        <b style="color: red;">Senaryo 3:</b><br>
	        Eğer <b>${assetName}</b> ${priceType} <b>${expiryDateFormatted}</b> tarihinde <b>${breakeven} TL</b> fiyatına eşit ise 
	        yatırımcı opsiyondan elde ettiği <b>${premium} TL</b> opsiyon primini kaybetse de nette herhangi bir kar veya zararı olmaz.
	    `;
	
	    const scenario4 = `
	        <b style="color: red;">Senaryo 4:</b><br>
	        Eğer <b>${assetName}</b> ${priceType} <b>${expiryDateFormatted}</b> tarihinde <b>${breakeven} TL</b> fiyatından 
	        ${optionType === "Call" ? "yüksek" : "düşük"} ise yatırımcı kullanım fiyatıyla başabaş fiyatı arasındaki fark kadar net zarar eder. 
	        <br>Aşağıdaki grafikte potansiyel kar zarar durumu görülebilir:
	    `;

	// İşlem onay metnini oluştur
	    const refPrice = parseFloat(document.getElementById("spotPrice").value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	    const delta = parseFloat(document.getElementById("deltaValue").value).toFixed(0); // Varsayılan delta değeri
    	    const contractAmount = parseInt(document.getElementById("cSize").value) || 1; // Kullanıcının girdiği kontrat sayısı
	    const expiryFormatted = expiryDateFormatted.split(" ")[0] + expiryDateFormatted.split(" ")[1].substring(0, 3); // "28Feb" gibi format
	    const optionCode = `${assetName}-${expiryFormatted}-${optionType}-${strikePrice}`;
	    const orderMessage = `"${optionCode} @${premium} (${refPrice}ref, ${delta}d) ${contractAmount}c için DONE"`;

	    let optionTypeMessage = "";
	    let multiplier = 100; // Varsayılan: Hisse opsiyonları (100)
	
	    if (assetName.toUpperCase() === "XU030") {
	        optionTypeMessage = `Bu bir <b>endeks opsiyonudur.</b> 1 kontrat endeks opsiyonu <b>10</b> endekse karşılık gelmektedir.`;
	        multiplier = 10;
	    } else if (assetName.toUpperCase() === "USDTRY") {
	        optionTypeMessage = `Bu bir <b>döviz opsiyonudur.</b> 1 kontrat USDTRY döviz opsiyonu <b>1000</b> dolarlık büyüklüğe karşılık gelmektedir.`;
	        multiplier = 1000;
	    } else {
	        optionTypeMessage = `Bu bir <b>hisse opsiyonudur.</b> 1 kontrat hisse opsiyonu <b>100</b> hisseye karşılık gelmektedir.`;
	        multiplier = 100;
	    }
	
	    // Toplam kontrat büyüklüğü ve prim kazancı hesaplamaları
	    const totalUnits = contractAmount * multiplier;
	    const totalPremiumEarned = (totalUnits * premium).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

	    // Açıklama metnini güncelle
	    descriptionElement.innerHTML = `
    		${optionTypeMessage}<br>
    		Yatırımcının alacağı prim ${assetName.toUpperCase() === "USDTRY" ? "her 1 dolar için" : assetName.toUpperCase() === "XU030" ? "endeks başına" : "hisse başına"} <b>${premium} TL</b>, <b>${contractAmount} kontrat</b> için toplamda <b>${totalPremiumEarned} TL</b>'dir.
      		<br>
     		${dividendMessage}
     		<b>Tüm kontrolleri yaptıktan sonra eğer bu işlemi gerçekleştirmek istiyorsanız lütfen aşağıdaki metni kopyalayıp satış yetkilisine iletiniz:</b><br>
		<span id="orderText" style="display: inline-block; background-color: #f4f4f4; padding: 5px; border-radius: 5px; font-family: monospace;">
		    ${orderMessage}
		</span>
  		<br>
		<button type="button" onclick="copyOrderText()" class="btn btn-secondary">Metni Kopyala</button>
		<br><br>
	        Opsiyonun başabaş fiyatı <b>${breakeven} TL</b>'dir. Buna göre oluşan 4 senaryo aşağıdaki gibidir:<br><br>
	        ${scenario1} <br><br> ${scenario2} <br><br> ${scenario3} <br><br> ${scenario4}	        
	    `;
	    drawProfitLossChart();
	}

	function copyOrderText() {
	    if (event) {
	        event.preventDefault(); // Sayfanın yenilenmesini engelle
	    }
	    const orderTextElement = document.getElementById("orderText");
	    const textToCopy = orderTextElement.innerText;
	
	    navigator.clipboard.writeText(textToCopy).then(() => {
	        alert("Metin başarıyla kopyalandı!");
	    }).catch(err => {
	        console.error("Metin kopyalanırken hata oluştu:", err);
	        alert("Metin kopyalanamadı, lütfen manuel olarak seçip kopyalayın.");
	    });
	}

	function drawProfitLossChart() {
	    window.profitLossChart = null;
	    const canvasContainer = document.getElementById('canvasContainer');
	
	    // Önceki canvas'ı sil ve yeniden oluştur
	    const oldCanvas = document.getElementById('profitLossChart');
	    if (oldCanvas) {
	        oldCanvas.remove(); // Eski canvas'ı tamamen kaldır
	    }
	
	    // Yeni canvas oluştur
	    const newCanvas = document.createElement('canvas');
	    newCanvas.id = 'profitLossChart';
	    newCanvas.width = 400;
	    newCanvas.height = 400;
	    canvasContainer.appendChild(newCanvas); // Yeni canvas'ı tekrar ekle
	
	    // Yeni canvas için context al
	    const ctx = newCanvas.getContext('2d');
	
	    // Gerekli değerleri al
	    const strikePrice = parseFloat(document.getElementById("strike").value);
	    const optionType = document.getElementById("optionType").value;
	    const premium = parseFloat(document.getElementById("optionPrice").value); // Hesaplanan opsiyon fiyatı
	
	    // Fiyat seviyelerini belirle (örnek: 10 fiyat seviyesi önce ve sonra)
	    priceLevels = [];
	    for (let i = -10; i <= 10; i++) {
	        priceLevels.push(strikePrice + i * 2); // 2'şer fiyat aralıklarıyla
	    }
	
	    // Kâr/Zarar hesaplama
	    profitLoss = [];
	    profitLoss = priceLevels.map(price => {
	        if (optionType === "Call") {
	            return Math.min(strikePrice - price, 0) + premium; // Call opsiyon formülü
	        } else {
	            return Math.min(price - strikePrice, 0) + premium; // Put opsiyon formülü
	        }
	    });
	
	    // Başabaş noktası
	    const breakeven = optionType === "Call"
	        ? strikePrice + premium // Call için Başabaş = Kullanım fiyatı + Prim
	        : strikePrice - premium; // Put için Başabaş = Kullanım fiyatı - Prim
	
	    // Eğer önceki grafik varsa, önce onu yok et
	    if (window.profitLossChart) {
	        window.profitLossChart.destroy();
	        window.profitLossChart = null; // Değişkeni sıfırla
	    }

	    // Grafik oluştur
	    window.profitLossChart = new Chart(ctx, {
	        type: 'line',
	        data: {
	            labels: priceLevels,
	            datasets: [{
	                label: 'Kâr/Zarar (P&L)',
	                data: profitLoss,
	                borderColor: 'green',
	                borderWidth: 2,
	                fill: false
	            }]
	        },
	        options: {
	            responsive: true,
	            maintainAspectRatio: false,
	            plugins: {
	                annotation: {
	                    annotations: {
	                        breakevenLine: {
	                            type: 'line',
	                            scaleID: 'x',
	                            value: breakeven,
	                            borderColor: 'red',
	                            borderWidth: 2,
	                            label: {
	                                content: 'Başabaş Noktası',
	                                enabled: true,
	                                position: 'top'
	                            }
	                        }
	                    }
	                }
	            },
	            scales: {
	                x: {
	                    title: { display: true, text: 'Dayanak Varlık Fiyatı' }
	                },
	                y: {
	                    title: { display: true, text: 'Kâr/Zarar' }
	                }
	            }
	        }
	    });
	}	    
	    
        function loadDataForUser(user) {
            const jsonFile = user === "YBA" 
                ? "https://cdn.jsdelivr.net/gh/baryamhan/option-pricing@latest/yba.json"
                : "https://option-pricing-2590953718d2.herokuapp.com/json/sube.json";

            fetchData(jsonFile);
        }

	function toggleManualSpot() { 
	    const spotInput = document.getElementById("spotPrice");
	    const manualSpotCheckbox = document.getElementById("manualSpot");
	
	    if (manualSpotCheckbox.checked) {
	        spotInput.removeAttribute("readonly");
	    } else {
	        spotInput.setAttribute("readonly", true);
	        spotInput.value = 100; // Varsayılan değere geri döner
	    }
	}
	    
        async function fetchData(jsonFile) {
            try {
                console.log("JSON Yükleniyor:", jsonFile);
                const response = await fetch(jsonFile);
                const data = await response.json();
                populateAssetDropdown(data);
            } catch (error) {
                console.error("JSON verisi çekilemedi:", error);
                alert("Verileri yüklerken hata oluştu. Lütfen konsolu kontrol edin.");
            }
        }

        function populateAssetDropdown(data) {
            const assetDropdown = document.getElementById("asset");
            assetDropdown.innerHTML = ""; 

            data.forEach(item => {
                let option = document.createElement("option");
                option.value = item["Asset"];
                option.textContent = item["Asset"];
                assetDropdown.appendChild(option);
            });

            assetDropdown.addEventListener("change", () => updateAssetDetails(data));
            updateAssetDetails(data);
        }

        function updateAssetDetails(data) {
            const asset = document.getElementById("asset").value;
            const selectedAsset = data.find(item => item["Asset"] === asset);

            if (selectedAsset) {
                document.getElementById("dividend").value = selectedAsset["Dividend"].toFixed(2);
                document.getElementById("interestRate").value = selectedAsset["Interest Rate (%)"];
                document.getElementById("volatility").value = "";

                const excelBaseDate = new Date(1899, 11, 30);
                const properDate = new Date(excelBaseDate.getTime() + selectedAsset["Dividend Date"] * 86400000);
                document.getElementById("dividendDate").value = properDate.toISOString().split('T')[0];
            }
        }

	function calculateDaysToExpiry() {
        const expiryInput = document.getElementById("expiry").value;

        if (!expiryInput) {
            document.getElementById("daysToExpiry").value = "";
            return;
        }

        const expiryDate = new Date(expiryInput);
        const today = new Date();

        // Sadece tarih kısmını al (saat farkları sorun yaratmasın)
        const timeDiff = expiryDate.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
        const daysToExpiry = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysToExpiry < 0) {
            alert("Seçilen vade tarihi geçmiş olamaz!");
            document.getElementById("expiry").value = "";
            document.getElementById("daysToExpiry").value = "";
            return;
        }

        document.getElementById("daysToExpiry").value = daysToExpiry;
    }

	function normalCDF(x) {
	    // Standart normal dağılım fonksiyonu (N(x)) için Gauss hata fonksiyonu yaklaşımı
	    const p = 0.3275911;
	    const a1 = 0.254829592;
	    const a2 = -0.284496736;
	    const a3 = 1.421413741;
	    const a4 = -1.453152027;
	    const a5 = 1.061405429;
	
	    const sign = x < 0 ? -1 : 1;
	    const absX = Math.abs(x) / Math.sqrt(2.0);
	    const t = 1.0 / (1.0 + p * absX);
	    
	    // Gauss hata fonksiyonu (erf) için yaklaşım
	    const erfApprox = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
	    
	    return 0.5 * (1.0 + sign * erfApprox);
	}
		    
	function calculateOptionPrice() {
	    const asset = document.getElementById("asset").value;
	    const spotPrice = parseFloat(document.getElementById("spotPrice").value);
	    const daysToExpiry = parseInt(document.getElementById("daysToExpiry").value);
	    const strike = parseFloat(document.getElementById("strike").value);
	    const interestRate = parseFloat(document.getElementById("interestRate").value) / 100;
	
	    // ✅ Call/Put seçimini `select` kutusundan alıyoruz
	    const optionTypeElement = document.getElementById("optionType");
	    if (!optionTypeElement) {
	        alert("Hata: Call/Put seçimi için 'optionType' bulunamadı!");
	        return;
	    }
	    const optionType = optionTypeElement.value;
	
	    if (isNaN(spotPrice) || isNaN(daysToExpiry) || isNaN(strike) || isNaN(interestRate)) {
	        alert("Lütfen tüm alanları eksiksiz doldurun.");
	        return;
	    }
	
	    // ✅ Kullanıcı giriş bilgisine göre doğru JSON dosyasını seçiyoruz
	    const loggedInUser = localStorage.getItem("loggedInUser");
	    const jsonFile = loggedInUser === "YBA"
	        ? "https://cdn.jsdelivr.net/gh/baryamhan/option-pricing@latest/yba.json"
	        : "https://option-pricing-2590953718d2.herokuapp.com/json/sube.json";
	
	    fetch(jsonFile)
	        .then(response => response.json())
	        .then(data => {
	            const selectedAsset = data.find(item => item["Asset"] === asset);
	
	            if (!selectedAsset) {
	                alert("Hata: Seçili dayanak varlık JSON'da bulunamadı!");
	                return;
	            }
	
	            // ✅ 1. ATMVol'ü JSON'dan al
	            const atmVol = selectedAsset["Volatility (%)"] / 100;
			
	            const dividend = selectedAsset["Dividend"];
	            const dividendDate = new Date(document.getElementById("dividendDate").value);
	            const expiryDate = new Date(document.getElementById("expiry").value);
	            const today = new Date();
			
	            document.getElementById("volatility").value = (volatility * 100).toFixed(2);
	
	            // ✅ Eğer temettü tarihi geçmişteyse veya vade sonu tarihinden büyükse temettü verimi = 0
	            let dividendYield = 0;
	            if (dividendDate > today && dividendDate <= expiryDate) {
	                dividendYield = dividend / spotPrice * 365 / daysToExpiry;
	            }
			
	            // ✅ 2. Slope sabit değer olarak -0.05
	            const slope = -0.05;
	
		    // ✅ 2. Curvature'ları tanımla
		    let callcur = selectedAsset["Call Curvature"]
		    let putcur = selectedAsset["Put Curvature"]
			
	            // ✅ 3. Forward fiyatını Euler yöntemiyle hesapla
	            const fwd = spotPrice * Math.exp((interestRate - dividendYield) * (daysToExpiry / 365));
	            
		    // ✅ 4. ln(Strike / Fwd) hesapla
	            let logStrikeFwd = Math.log(strike / fwd);
	
	            // ✅ 5. X değerini bul
	            let X = (fwd > strike) 
	                ? Math.max(logStrikeFwd, -0.5) 
	                : Math.min(logStrikeFwd, 0.5);
	
	            // ✅ 6. Adjusted Volatility hesapla Call/Put'a göre
		    const curvature = optionType === "Call" 
			? callcur 
			: putcur;
	
	            let adjustedVolatility = (atmVol + (slope * X) + (Math.pow(X, 2) * 1.2));
			
		    // ✅ 7. Güncellenmiş volatiliteyi input'a yaz
	            document.getElementById("volatility").value = (adjustedVolatility * 100).toFixed(2);
			
	            // ✅ Vadeye kalan süre yıl cinsinden
	            const T = daysToExpiry / 365;
	
	            // ✅ Temettü düzeltilmiş spot fiyat
	            const adjustedSpotPrice = spotPrice * Math.exp(-dividendYield * T);
	
	            // ✅ Black-Scholes d1 ve d2 hesaplamaları
	            const d1 = (Math.log(adjustedSpotPrice / strike) + (interestRate + (adjustedVolatility ** 2) / 2) * T) / (adjustedVolatility * Math.sqrt(T));
	            const d2 = d1 - adjustedVolatility * Math.sqrt(T);
		    const Nd1 = normalCDF(d1); // N(d1)
		
		    // ✅ Delta hesaplaması (Call & Put)
		    let delta;
		    if (optionType === "Call") {
		        delta = Nd1;
		    } else {
		        delta = Nd1 - 1;
		    }
			
		    // ✅ Delta değerini ekrana yazdır
		    document.getElementById("deltaValue").value = parseFloat(delta * 100).toFixed(0);
			
	            let optionPrice;
	
	            if (optionType === "Call") {
	                optionPrice = (adjustedSpotPrice * normalCDF(d1)) - (strike * Math.exp(-interestRate * T) * normalCDF(d2));
	            } else if (optionType === "Put") {
	                optionPrice = (strike * Math.exp(-interestRate * T) * normalCDF(-d2)) - (adjustedSpotPrice * normalCDF(-d1));
	            } else {
	                alert("Hata: Geçersiz opsiyon türü!");
	                return;
	            }
	
	            document.getElementById("optionPrice").value = optionPrice.toFixed(2);
	        })
	
	        .catch(error => {
	            console.error("Hata:", error);
	            alert("Veriler yüklenirken hata oluştu.");
	        });
		activateOptionDescription();
	}


	async function uploadExcel(inputId, jsonFileName) {
	    const fileInput = document.getElementById(inputId);
	    const uploadMessage = document.getElementById("uploadMessage");
	
	    if (fileInput.files.length === 0) {
	        uploadMessage.innerText = "Lütfen bir dosya seçin!";
	        uploadMessage.style.color = "red";
	        return;
	    }
	
	    const file = fileInput.files[0];
	    const formData = new FormData();
	    formData.append("file", file);
	    formData.append("jsonFileName", jsonFileName);
	
	    try {
	        const response = await fetch("http://localhost:3000/upload-excel", {
	            method: "POST",
	            body: formData
	        });
	
	        const result = await response.json();
	        uploadMessage.innerText = `Dosya "${file.name}" başarıyla JSON'a çevrildi: ${result.jsonFile}`;
	        uploadMessage.style.color = "green";
	    } catch (error) {
	        console.error("Dosya yükleme hatası:", error);
	        uploadMessage.innerText = "Dosya yüklenirken hata oluştu!";
	        uploadMessage.style.color = "red";
	    }
	}

