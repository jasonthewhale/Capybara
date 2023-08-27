chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.countdown_value !== undefined && request.malicious_link_count !== undefined) {
        
        
        const riskElement = document.getElementById('riskLevel');
        const riskImageElement = document.getElementById('riskImage');
        const countdownElement = document.getElementById('countdownSum');
        const hiddenRisk = document.getElementById('hiddenSum');
        const checkboxRisk = document.getElementById('checkboxSum');
        
        countdownElement.textContent = "sum: " + request.countdown_value;
        hiddenRisk.textContent = "sum: " + request.malicious_link_count;

        if ((request.countdown_value + request.malicious_link_count)> 50) {
            riskImageElement.src = 'src/high-risk.png';
            riskElement.style.color = '#d81e06';
            riskElement.textContent = "High Risk";
        }else if (countdown_value > 5) {
            riskImageElement.src = 'src/middle-risk.png';
            riskElement.style.color = '#f4ea2a';
            riskElement.textContent = "Moderate Risk";
  }
  
      }
    });
