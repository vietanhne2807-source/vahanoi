(function(){
  let baseEl, letterEl, out, calcButton, resetButton;
  
  const nextLetter = [
    {min:8.5, max:10, key:'A', gpa:4.0},
    {min:7.0, max:8.4, key:'B', gpa:3.0},
    {min:5.5, max:6.9, key:'C', gpa:2.0},
    {min:4.0, max:5.4, key:'D', gpa:1.0},
    {min:0.0, max:3.9, key:'F', gpa:0.0},
  ];

  // Khởi tạo khi DOM đã sẵn sàng
  document.addEventListener('DOMContentLoaded', function() {
    initElements();
    initCustomSelect();
    initBackgroundEffect();
    initEventListeners();
    initProtection(); 
  });

  // Khởi tạo bảo vệ trang web
  function initProtection() {
    // Vô hiệu hóa chuột phải
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    });

    // Vô hiệu hóa phím tắt
    document.addEventListener('keydown', function(e) {
      // Chặn F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      
      // Chặn Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        return false;
      }
      
      // Chặn Ctrl+U (xem source)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return false;
      }
      
      // Chặn Ctrl+C, Ctrl+X (copy, cut)
      if (e.ctrlKey && (e.key === 'C' || e.key === 'c' || e.key === 'X' || e.key === 'x')) {
        e.preventDefault();
        return false;
      }
    });

    // Vô hiệu hóa DevTools khi mở bằng các phương thức khác
    let devToolsOpened = false;
    
    function detectDevTools() {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!devToolsOpened) {
          devToolsOpened = true;
          alert('Vui lòng không sử dụng DevTools!');
        }
      } else {
        devToolsOpened = false;
      }
    }
    
    window.addEventListener('resize', detectDevTools);
    setInterval(detectDevTools, 1000);
  }

  // Khởi tạo các elements
  function initElements() {
    baseEl = document.getElementById('base');
    letterEl = document.getElementById('letter');
    out = document.getElementById('out');
    calcButton = document.getElementById('calc');
    resetButton = document.getElementById('reset');

    // Thêm validation cho input điểm số
    baseEl.addEventListener('input', function(e) {
      let value = e.target.value;
      
      // Chuyển dấu phẩy thành dấu chấm
      value = value.replace(/,/g, '.');
      
      // Chỉ cho phép số và dấu chấm
      value = value.replace(/[^\d.]/g, '');
      
      // Chỉ cho phép một dấu chấm
      const dots = value.match(/\./g);
      if (dots && dots.length > 1) {
        value = value.replace(/\.+$/, '');
      }
      
      // Cho phép nhập số thập phân
      if (value.includes('.')) {
        let [whole, decimal] = value.split('.');
        // Giữ lại tối đa 2 chữ số thập phân
        value = whole + '.' + (decimal || '').substring(0, 2);
      }
      
      // Kiểm tra và hiển thị thông báo nếu điểm > 10
      if (value !== '' && value !== '.') {
        const numValue = parseFloat(value);
        if (numValue > 10) {
          show(`<span class="pill bad">Điểm không hợp lệ</span> Điểm số không thể lớn hơn 10! Vui lòng nhập lại.`, 'bad');
          value = '';
        } else if (numValue < 0) {
          show(`<span class="pill bad">Điểm không hợp lệ</span> Điểm số không thể âm! Vui lòng nhập lại.`, 'bad');
          value = '';
        }
      }
      
      e.target.value = value;

      // Ẩn thông báo lỗi nếu giá trị hợp lệ hoặc trống
      if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 10)) {
        out.style.display = 'none';
      }
    });
  }

  // Thêm các event listeners
  function initEventListeners() {
    calcButton.addEventListener('click', compute);
    resetButton.addEventListener('click', resetForm);
    document.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        compute();
      }
    });
  }

  // Hàm reset form
  function resetForm() {
    baseEl.value = '';
    letterEl.value = '';
    document.querySelector('.select-selected').textContent = 'Chọn điểm chữ muốn đạt';
    document.querySelector('.select-selected').style.color = '#64748b';
    document.querySelectorAll('.select-option').forEach(opt => opt.classList.remove('selected'));
    out.style.display = 'none';
    baseEl.focus();
  }

  // Thêm hiệu ứng background theo chuột
  function initBackgroundEffect() {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.body.style.setProperty('--mouse-x', `${x}%`);
      document.body.style.setProperty('--mouse-y', `${y}%`);
    });
  }

  // Hàm khởi tạo custom select
  function initCustomSelect() {
    const customSelect = document.querySelector('.custom-select');
    const selectSelected = customSelect.querySelector('.select-selected');
    const selectItems = customSelect.querySelector('.select-items');
    const hiddenSelect = customSelect.querySelector('select');
    const options = customSelect.querySelectorAll('.select-option');

    selectSelected.addEventListener('click', function(e) {
      e.stopPropagation();
      this.classList.toggle('select-arrow-active');
      selectItems.classList.toggle('select-hide');
      
      // Thêm animation delay cho từng option
      options.forEach((option, index) => {
        option.style.setProperty('--index', index);
      });
    });

    options.forEach(option => {
      option.addEventListener('click', function(e) {
        e.stopPropagation();
        const value = this.getAttribute('data-value');
        const text = this.textContent;
        
        if (value) {
          selectSelected.textContent = text;
          selectSelected.style.color = '#1e293b';
          options.forEach(opt => opt.classList.remove('selected'));
          this.classList.add('selected');
          hiddenSelect.value = value;
        }

        selectItems.classList.add('select-hide');
        selectSelected.classList.remove('select-arrow-active');
      });
    });

    document.addEventListener('click', function() {
      selectItems.classList.add('select-hide');
      selectSelected.classList.remove('select-arrow-active');
    });
  }

  function clamp(x, lo, hi){ 
    return Math.max(lo, Math.min(hi, x)); 
  }

  function fmt(x){ 
    return Number.parseFloat(x).toFixed(1).replace(/\.0$/,'');
  }

  function compute(){
    if(!baseEl.value){
      show(`<span class="pill bad">Lỗi</span> Quên nhập điểm rồi kìa, không nhập tính kiểu gì ???`, 'bad');
      return;
    }
    if(!letterEl.value){
      show(`<span class="pill bad">Lỗi</span> Bạn chưa chọn điểm chữ muốn đạt kìa!!!`, 'bad');
      return;
    }
    let base = Number(baseEl.value);
    
    // Kiểm tra điểm nhập vào
    if(Number.isNaN(base)) {
      show(`<span class="pill bad">Lỗi</span> Điểm không hợp lệ! Vui lòng nhập số.`, 'bad');
      baseEl.focus();
      return;
    }
    if(base > 10) {
      show(`<span class="pill bad">Ơ kìa</span> Điểm tối đa là 10 thôi! Bạn nhập ${base} là sao? 🤔<br>
            <small class="error-hint">* Vui lòng nhập điểm từ 0 đến 10</small>`, 'bad');
      baseEl.focus();
      return;
    }
    if(base < 0) {
      show(`<span class="pill bad">Lỗi</span> Điểm số không thể âm được! Vui lòng nhập điểm từ 0 đến 10.`, 'bad');
      baseEl.focus();
      return;
    }
    
    // Kiểm tra xem điểm chữ đã chọn có khả thi không

    const [gminStr,gmaxStr,key,gpa] = letterEl.value.split('|');
    const gmin = Number(gminStr), gmax = Number(gmaxStr);
    
    // Kiểm tra xem điểm chữ có khả thi không
    let maxPossibleGrade = (base + 10) / 2;
    if (maxPossibleGrade < gmin) {
      show(`
            <div class="pill-container">
              <span class="pill bad">BẤT KHẢ THI</span>
              <span class="pill warn">EM ĐEN LẮM</span>
            </div>
            <p class="lead">Không thể tích ${key} như bạn mong muốn.</p>
            <p><span class="highlight-text">Ngay cả khi đạt điểm tối đa là <b>10</b> ở lần thi KTHP, điểm trung bình của bạn chỉ có thể đạt tối đa <b>${fmt(maxPossibleGrade)}</b>, không đủ để tích <b>${key}</b>.</p>`, 'bad');
      return;
    }

    const L = 2*gmin - base;
    const U = 2*gmax - base;
    const Lc = clamp(L, 0, 10);
    const Uc = clamp(U, 0, 10);

    let html = `<h3>🎯 Mục tiêu: <b>điểm ${key}</b></h3>`;
    html += `<div class="muted">Điểm gốc: <b>${fmt(base)}</b></div>`;

    if (Lc > Uc) {
      html += `<p class="lead"><span class="pill bad">Không khả thi</span> Không thể đạt <b>${key}</b> chỉ với <b>một</b> lần chấm còn lại (giới hạn 0–10).</p>`;
      html += detailBlock(L,U,Lc,Uc);
      show(html,'bad'); 
      return;
    }

    const needMin = Lc;
    const upgrade = findUpgrade(base, Uc);

    if (needMin <= 0) {
      html += `<p class="lead"><span class="pill ok">Bạn đã đạt mức ${key}</span> Chỉ cần giữ X trong khoảng <b>[0 – ${fmt(Uc)}]</b> để trung bình vẫn thuộc ${key}.</p>`;
    } else {
      html += `<p class="lead">Bạn cần tối thiểu <b>${fmt(needMin)}</b> (và tối đa <b>${fmt(Uc)}</b>)</p>`;
    }

    html += detailBlock(L,U,Lc,Uc);
    show(html,'ok');
  }

  function detailBlock(L,U,Lc,Uc){
    return `
      <div class="note">
        <b>HOW TO STUDY ???</b><br>
        <br>
        <b>HỌC - HỌC NỮA - HỌC MÃI<br>
        HÃY HỌC VÌ HỌC RẤT TỐT CHO SỨC KHỎE<br>
        HỌC ĐẬM SÂU - HỌC MÃNH LIỆT - HỌC MẤT KIỂM SOÁT</b><br>
      </div>`;
  }

  function findUpgrade(base, currentUpperX){
    const eps = 1e-9;
    const avgIfUpperX = (base + (currentUpperX + eps))/2;
    for (const h of nextLetter){
      if (avgIfUpperX >= h.min && avgIfUpperX <= 10){
        const needXForH = 2*h.min - base;
        if (needXForH <= 10){
          return {letter: h.key, threshold: Math.max(0, needXForH)};
        }
      }
    }
    return null;
  }

  function show(inner, tone){
    out.style.display = 'block';
    out.style.background = tone==='bad'
      ? 'linear-gradient(145deg,#fee2e2,#fff7ed)'
      : 'linear-gradient(145deg,#d1fae5,#ecfeff)';
    out.style.borderColor = tone==='bad' ? '#fecaca' : '#a7f3d0';
    out.innerHTML = inner;
  }
})();