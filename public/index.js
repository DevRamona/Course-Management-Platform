class ReflectionPage {
    constructor() {
        this.currentLanguage = 'en';
        this.reflectionData = null;
        this.init();
    }

    init() {
        this.setupLanguageDetection();
        this.setupEventListeners();
        this.loadSavedLanguage();
        this.updateContent();
    }

    setupLanguageDetection() {
        const browserLang = navigator.language || navigator.userLanguage;
        const shortLang = browserLang.split('-')[0];
        
        if (translations[shortLang]) {
            this.currentLanguage = shortLang;
        }
    }

    setupEventListeners() {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                this.switchLanguage(lang);
            });
        });

        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        const editBtn = document.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            this.showForm();
        });
    }

    loadSavedLanguage() {
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang && translations[savedLang]) {
            this.currentLanguage = savedLang;
        }
    }

    switchLanguage(lang) {
        if (!translations[lang]) return;

        this.currentLanguage = lang;
        localStorage.setItem('preferredLanguage', lang);
        
        document.documentElement.lang = lang;
        
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            }
        });

        this.updateContent();
    }

    updateContent() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.dataset.i18n;
            const translation = translations[this.currentLanguage][key];
            
            if (translation) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        document.title = translations[this.currentLanguage].pageTitle;
    }

    handleSubmit() {
        const formData = {
            question1: document.getElementById('question1').value.trim(),
            question2: document.getElementById('question2').value.trim(),
            question3: document.getElementById('question3').value.trim(),
            submittedAt: new Date().toISOString(),
            language: this.currentLanguage
        };

        if (!formData.question1 || !formData.question2 || !formData.question3) {
            this.showAlert('Please fill in all questions before submitting.', 'error');
            return;
        }

        this.reflectionData = formData;
        localStorage.setItem('reflectionData', JSON.stringify(formData));
        
        this.showReflection();
        this.showAlert('Reflection submitted successfully!', 'success');
    }

    showReflection() {
        const form = document.querySelector('.reflection-form');
        const display = document.getElementById('reflectionDisplay');
        const content = document.getElementById('reflectionContent');

        form.style.display = 'none';
        display.style.display = 'block';

        content.innerHTML = `
            <div class="reflection-item">
                <h4>${translations[this.currentLanguage].question1Label}</h4>
                <p>${this.reflectionData.question1}</p>
            </div>
            <div class="reflection-item">
                <h4>${translations[this.currentLanguage].question2Label}</h4>
                <p>${this.reflectionData.question2}</p>
            </div>
            <div class="reflection-item">
                <h4>${translations[this.currentLanguage].question3Label}</h4>
                <p>${this.reflectionData.question3}</p>
            </div>
        `;
    }

    showForm() {
        const form = document.querySelector('.reflection-form');
        const display = document.getElementById('reflectionDisplay');

        display.style.display = 'none';
        form.style.display = 'block';

        if (this.reflectionData) {
            document.getElementById('question1').value = this.reflectionData.question1;
            document.getElementById('question2').value = this.reflectionData.question2;
            document.getElementById('question3').value = this.reflectionData.question3;
        }
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        if (type === 'success') {
            alertDiv.style.background = '#27ae60';
        } else {
            alertDiv.style.background = '#e74c3c';
        }

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(alertDiv);
            }, 300);
        }, 3000);
    }

    loadSavedReflection() {
        const saved = localStorage.getItem('reflectionData');
        if (saved) {
            this.reflectionData = JSON.parse(saved);
            this.showReflection();
        }
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    const reflectionPage = new ReflectionPage();
    reflectionPage.loadSavedReflection();
}); 