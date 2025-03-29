// Константи та конфігурація
const CONFIG = {
    animationDuration: 300,
    minPasswordLength: 6,
    apiEndpoint: '/api'
};

// Стан додатку
const AppState = {
    menuState: JSON.parse(localStorage.getItem('menuState') || '{}'),
    lastSection: localStorage.getItem('lastSection') || 'home',
    isMenuOpen: false
};

// Утиліти для валідації
const Validator = {
    email: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    phone: (phone) => {
        const phoneRegex = /^\+?\d{10,13}$/;
        return phoneRegex.test(phone);
    },
    
    required: (value) => value && value.trim().length > 0,
    
    validateForm: (formData) => {
        const errors = [];
        
        if (!Validator.required(formData.get('name'))) {
            errors.push('Ім\'я обов\'язкове');
        }
        
        if (!Validator.email(formData.get('email'))) {
            errors.push('Невірний формат email');
        }
        
        if (!Validator.required(formData.get('message'))) {
            errors.push('Повідомлення обов\'язкове');
        }
        
        return errors;
    }
};

// Обробники подій
const EventHandlers = {
    async handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const submitBtn = form.querySelector('.submit-btn');
        
        // Валідація
        const errors = Validator.validateForm(formData);
        if (errors.length > 0) {
            UI.showErrors(errors);
            return;
        }
        
        UI.setSubmitState(submitBtn, true);
        
        try {
            await API.submitForm(formData);
            UI.showSuccess('Повідомлення надіслано успішно!');
            form.reset();
        } catch (error) {
            UI.showError('Помилка при відправці. Спробуйте пізніше.');
            console.error('Form submission error:', error);
        } finally {
            UI.setSubmitState(submitBtn, false);
        }
    },

    handleMenuToggle() {
        AppState.isMenuOpen = !AppState.isMenuOpen;
        UI.toggleMenu(AppState.isMenuOpen);
    }
};

// UI утиліти
const UI = {
    showErrors(errors) {
        const errorContainer = document.getElementById('errorContainer') || 
            this.createErrorContainer();
        
        errorContainer.innerHTML = errors
            .map(error => `<div class="error-message">${error}</div>`)
            .join('');
        
        errorContainer.style.display = 'block';
        setTimeout(() => {
            errorContainer.style.opacity = '0';
            setTimeout(() => {
                errorContainer.style.display = 'none';
                errorContainer.style.opacity = '1';
            }, 300);
        }, 3000);
    },

    createErrorContainer() {
        const container = document.createElement('div');
        container.id = 'errorContainer';
        container.className = 'error-container';
        document.body.appendChild(container);
        return container;
    },

    setSubmitState(button, isLoading) {
        button.disabled = isLoading;
        button.textContent = isLoading ? 'Надсилання...' : 'Надіслати';
    },

    showSuccess(message) {
        // Показ повідомлення про успіх
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = message;
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    },

    showError(message) {
        this.showErrors([message]);
    },
    
    toggleMenu(isOpen) {
        const menuContainer = document.getElementById('menuContainer');
        const burgerMenu = document.querySelector('.burger-menu');
        
        if (!menuContainer || !burgerMenu) return;
        
        menuContainer.classList.toggle('active', isOpen);
        burgerMenu.classList.toggle('active', isOpen);
        
        // Додаємо затемнення для мобільного меню
        let overlay = document.getElementById('menu-overlay');
        if (isOpen && window.innerWidth <= 768) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'menu-overlay';
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.right = '0';
                overlay.style.bottom = '0';
                overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
                overlay.style.zIndex = '999';
                overlay.style.display = 'none';
                document.body.appendChild(overlay);
                
                overlay.addEventListener('click', () => {
                    AppState.isMenuOpen = false;
                    this.toggleMenu(false);
                });
            }
            overlay.style.display = 'block';
        } else if (overlay) {
            overlay.style.display = 'none';
        }
    }
};

// API взаємодія
const API = {
    async submitForm(formData) {
        // Імітація відправки на сервер
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 1000);
        });
    }
};

// Оновлений MenuHandler з підтримкою вкладених підменю
const MenuHandler = {
    createMenuItem(item) {
        const li = document.createElement('li');
        li.className = 'menu-item';
        
        const a = document.createElement('a');
        a.href = item.link || '#';
        a.className = 'menu-link';
        if (item.active) a.classList.add('active');
        
        // Додаємо базовий текст пункту меню
        a.textContent = item.title;
        
        // Додаємо іконку стрілки, якщо є підменю
        if (item.submenu && item.submenu.length > 0) {
            const icon = document.createElement('i');
            icon.className = 'fas fa-chevron-down';
            a.appendChild(icon);
        }
        
        // Визначаємо, чи це локальний href чи зовнішній лінк
        if (item.link && (item.link.startsWith('#') || item.link === 'index.html')) {
            a.addEventListener('click', (e) => this.handleMenuClick(e, item));
        }
        
        li.appendChild(a);

        if (item.submenu?.length) {
            const ul = document.createElement('ul');
            ul.className = 'submenu';
            
            // На мобільних пристроях додаємо обробник для кнопки-перемикача
            if (window.innerWidth <= 768) {
                a.addEventListener('click', (e) => {
                    if (item.submenu?.length) {
                        e.preventDefault();
                        e.stopPropagation();
                        li.classList.toggle('show-submenu');
                    }
                });
            }
            
            item.submenu.forEach(subItem => {
                ul.appendChild(this.createMenuItem(subItem));
            });
            
            li.appendChild(ul);
        }

        return li;
    },

    handleMenuClick(e, item) {
        e.preventDefault();
        
        if (item.link === 'index.html') {
            // Для головної сторінки показуємо розділ "home"
            this.showSection('home');
            history.pushState({}, '', '#home');
        } else if (item.link.startsWith("#")) {
            const sectionId = item.link.slice(1);
            
            // Обробка кліків на послуги
            if (sectionId === 'services') {
                // Перевіряємо, чи це пункт категорії послуг
                if (item.title === 'Веб-розробка') {
                    this.showSection('services');
                    history.pushState({}, '', '#services');
                    // Активуємо відповідну вкладку послуг
                    setTimeout(() => {
                        document.querySelector('.service-tab[data-filter="web"]').click();
                    }, 100);
                } 
                else if (item.title === 'UI/UX Дизайн') {
                    this.showSection('services');
                    history.pushState({}, '', '#services');
                    setTimeout(() => {
                        document.querySelector('.service-tab[data-filter="design"]').click();
                    }, 100);
                }
                else if (item.title === 'Мобільна розробка') {
                    this.showSection('services');
                    history.pushState({}, '', '#services');
                    setTimeout(() => {
                        document.querySelector('.service-tab[data-filter="mobile"]').click();
                    }, 100);
                }
                else if (item.title === 'SEO Оптимізація') {
                    this.showSection('services');
                    history.pushState({}, '', '#services');
                    setTimeout(() => {
                        document.querySelector('.service-tab[data-filter="seo"]').click();
                    }, 100);
                }
                // Обробка кліків на HTML/CSS, JavaScript, CMS
                else if (item.title === 'HTML / CSS' || item.title === 'JavaScript' || item.title === 'CMS') {
                    this.showSection('services');
                    history.pushState({}, '', '#services');
                    // Спочатку вибираємо веб-розробку
                    setTimeout(() => {
                        document.querySelector('.service-tab[data-filter="web"]').click();
                        
                        // Показуємо детальну інформацію про цю технологію
                        setTimeout(() => {
                            ServiceHandler.showServiceDetail('web', item.title.toLowerCase().replace(' / ', '-'));
                        }, 200);
                    }, 100);
                }
                else {
                    this.showSection(sectionId);
                    history.pushState({}, '', item.link);
                }
            } else if (document.getElementById(sectionId)) {
                this.showSection(sectionId);
                history.pushState({}, '', item.link);
            }
            
            // Закриваємо мобільне меню при виборі пункту
            if (window.innerWidth <= 768) {
                AppState.isMenuOpen = false;
                UI.toggleMenu(false);
            }
        }
    },

    showSection(sectionId) {
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.updateMenuState(sectionId);
            
            // Прокручуємо до розділу
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    },

    updateMenuState(sectionId) {
        document.querySelectorAll('.menu-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId || 
                (sectionId === 'home' && link.getAttribute('href') === 'index.html')) {
                link.classList.add('active');
            }
        });
        localStorage.setItem('lastSection', sectionId);
    },

    async initMenu() {
        try {
            const response = await fetch('menu-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const menuData = await response.json();
            const menuContainer = document.getElementById('menuContainer');
            
            if (!menuContainer) {
                console.error('Menu container not found!');
                return;
            }
            
            // Очищаємо контейнер перед додаванням пунктів меню
            menuContainer.innerHTML = '';
            
            // Модифікуємо пункти меню для локальної навігації
            const modifiedItems = menuData.items.map(item => {
                // Змінюємо посилання на локальні
                if (item.link === 'index.html') {
                    return { ...item, active: true };
                }
                
                if (item.link.includes('pages/')) {
                    const pageName = item.link.split('/').pop().split('.')[0];
                    return { ...item, link: `#${pageName}` };
                }
                
                return item;
            });
            
            // Додаємо пункти меню
            modifiedItems.forEach(item => {
                menuContainer.appendChild(this.createMenuItem(item));
            });
        } catch (error) {
            console.error('Error loading menu:', error);
            UI.showError('Помилка завантаження меню');
        }
    }
};

// Дані для модальних вікон портфоліо
const portfolioData = {
    'corporate': {
        title: 'Корпоративний сайт "ЕкоБуд"',
        description: 'Сучасний корпоративний сайт для будівельної компанії з адаптивним дизайном та зручною системою управління контентом.',
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'WordPress'],
        challenges: 'Клієнт потребував сайт, що буде легко адаптуватися під різні екрани та матиме зручну панель адміністрування для редагування проектів та новин.',
        solution: 'Ми розробили сучасний адаптивний сайт на базі WordPress з індивідуальним дизайном та оптимізованою швидкістю завантаження.',
        results: 'Після запуску нового сайту кількість заявок збільшилась на 45%, а час перебування відвідувачів на сайті зріс у 2.5 рази.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    'ecommerce': {
        title: 'Інтернет-магазин "FashionTrend"',
        description: 'Сучасний інтернет-магазин одягу з інтуїтивно зрозумілим інтерфейсом та зручною системою фільтрації товарів.',
        technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
        challenges: 'Клієнт мав понад 5000 товарів, які потрібно було структурувати та забезпечити швидкий пошук і фільтрацію.',
        solution: 'Ми розробили кастомну систему фільтрації та пошуку, а також інтегрували платіжні системи та систему доставки.',
        results: 'Конверсія відвідувачів у покупців зросла на 32%, а середній чек збільшився на 18%.',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    'mobile-app': {
        title: 'Мобільний додаток "FitTracker"',
        description: 'Фітнес-додаток для відстеження тренувань, харчування та прогресу користувачів.',
        technologies: ['React Native', 'Firebase', 'Redux', 'Node.js'],
        challenges: 'Необхідно було розробити додаток для iOS та Android з синхронізацією даних та можливістю працювати офлайн.',
        solution: 'Ми створили крос-платформний додаток з використанням React Native та реалізували локальне зберігання даних з подальшою синхронізацією.',
        results: 'Додаток має рейтинг 4.8 в App Store та Google Play, понад 100 000 завантажень за перші два місяці.',
        image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    'blog-platform': {
        title: 'Блог платформа',
        description: 'Сучасна блог-платформа з можливістю публікації статей, коментарів та підписки на авторів.',
        technologies: ['Vue.js', 'Laravel', 'MySQL', 'AWS'],
        challenges: 'Клієнт потребував платформу з можливістю монетизації контенту та гнучкою системою управління користувачами.',
        solution: 'Ми розробили кастомну CMS з інтегрованою платіжною системою та розширеною аналітикою.',
        results: 'Платформа залучила понад 500 авторів та 50 000 читачів за перші три місяці роботи.',
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    }
};

// Дані для блогу
const blogData = {
    'web-trends': {
        title: 'Тренди веб-розробки 2024',
        author: 'Олександр Петренко',
        date: '15 березня 2024',
        image: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        content: `
            <p>Світ веб-розробки постійно еволюціонує, і 2024 рік не є винятком. Розглянемо найважливіші тренди, які визначатимуть майбутнє веб-розробки в цьому році:</p>
            
            <h4>1. Штучний інтелект та машинне навчання</h4>
            <p>ШІ продовжує трансформувати веб-розробку, пропонуючи нові можливості для персоналізації користувацького досвіду, оптимізації процесів та автоматизації рутинних задач.</p>
            
            <h4>2. Web Components і мікрофронтенди</h4>
            <p>Web Components стають все популярнішими, дозволяючи розробникам створювати повторно використовувані, інкапсульовані компоненти. Концепція мікрофронтендів також набирає обертів.</p>
            
            <h4>3. Прогресивні веб-додатки (PWA)</h4>
            <p>PWA продовжують розвиватись, забезпечуючи користувачів функціоналом, подібним до нативних додатків, але через веб-браузер.</p>
            
            <h4>4. JavaScript фреймворки нового покоління</h4>
            <p>Такі інструменти як Svelte, Solid.js та Qwik змінюють підходи до розробки, пропонуючи кращу продуктивність та спрощений процес розробки.</p>
            
            <h4>5. WebAssembly (WASM)</h4>
            <p>WASM дозволяє запускати код на низькому рівні у веб-браузері майже на нативній швидкості, відкриваючи нові можливості для веб-додатків.</p>
        `
    },
    'ui-ux-tips': {
        title: '5 порад з UI/UX дизайну',
        author: 'Марія Коваленко',
        date: '2 квітня 2024',
        image: 'https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        content: `
            <p>Створення інтерфейсів, які користувачі полюблять використовувати, вимагає розуміння психології, естетики та технічних аспектів. Ось 5 порад для покращення вашого UI/UX дизайну:</p>
            
            <h4>1. Зрозумійте свою аудиторію</h4>
            <p>Проведіть дослідження користувачів перед початком проектування. Розуміння потреб, поведінки та очікувань вашої аудиторії є фундаментом успішного UX дизайну.</p>
            
            <h4>2. Дотримуйтесь принципу консистентності</h4>
            <p>Використовуйте однакові елементи інтерфейсу, кольори, шрифти та патерни взаємодії по всьому продукту, щоб користувачам було легше орієнтуватися.</p>
            
            <h4>3. Спрощуйте</h4>
            <p>Мінімалізм та простота — ключ до хорошого дизайну. Видаляйте все зайве та залишайте тільки найнеобхідніше.</p>
            
            <h4>4. Забезпечте зрозумілий зворотний зв'язок</h4>
            <p>Користувачі повинні завжди розуміти, що відбувається в системі. Використовуйте візуальні сигнали, анімації та сповіщення для інформування про стан системи.</p>
            
            <h4>5. Тестуйте дизайн на реальних користувачах</h4>
            <p>Регулярно проводьте юзабіліті тестування вашого інтерфейсу з реальними користувачами та ітеруйте дизайн на основі отриманих відгуків.</p>
        `
    },
    'mobile-dev': {
        title: 'Нативна vs Кросплатформна розробка',
        author: 'Ігор Савченко',
        date: '20 квітня 2024',
        image: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        content: `
            <p>Вибір між нативною та кросплатформною розробкою мобільних додатків — одне з ключових рішень, яке необхідно прийняти перед початком проекту. Розглянемо основні відмінності, переваги та недоліки кожного підходу.</p>
            
            <h4>Нативна розробка</h4>
            <p><strong>Переваги:</strong></p>
            <ul>
                <li>Найвища продуктивність та швидкодія</li>
                <li>Повний доступ до нативних API та функцій пристрою</li>
                <li>Краща інтеграція з екосистемою платформи</li>
                <li>Кращий UX, що відповідає гайдлайнам платформи</li>
            </ul>
            <p><strong>Недоліки:</strong></p>
            <ul>
                <li>Вища вартість розробки (необхідність створювати окремі додатки для iOS та Android)</li>
                <li>Більший час розробки</li>
                <li>Необхідність мати спеціалістів з різних технологій</li>
            </ul>
            
            <h4>Кросплатформна розробка</h4>
            <p><strong>Переваги:</strong></p>
            <ul>
                <li>Швидша розробка (один кодбейс для всіх платформ)</li>
                <li>Нижча вартість</li>
                <li>Легше підтримувати та оновлювати</li>
                <li>Технології (React Native, Flutter) стають все потужнішими</li>
            </ul>
            <p><strong>Недоліки:</strong></p>
            <ul>
                <li>Потенційно нижча продуктивність</li>
                <li>Обмеження в доступі до нативних функцій</li>
                <li>Можливі проблеми з інтеграцією сторонніх бібліотек</li>
            </ul>
            
            <p>Вибір між цими підходами залежить від конкретних потреб проекту, бюджету, часу розробки та бізнес-цілей.</p>
        `
    }
};

// Функції для роботи з модальними вікнами
const ModalHandler = {
    init() {
        // Ініціалізація обробників для модальних вікон
        this.setupPortfolioModals();
        this.setupBlogModals();
        this.setupCloseButtons();
    },
    
    setupPortfolioModals() {
        const portfolioLinks = document.querySelectorAll('.view-project');
        const portfolioModal = document.getElementById('portfolio-modal');
        const portfolioDetails = document.getElementById('portfolio-details');
        
        if (!portfolioLinks.length || !portfolioModal || !portfolioDetails) return;
        
        portfolioLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const projectKey = link.getAttribute('data-project');
                const projectData = portfolioData[projectKey];
                
                if (projectData) {
                    portfolioDetails.innerHTML = this.generatePortfolioContent(projectData);
                    this.openModal(portfolioModal);
                }
            });
        });
    },
    
    setupBlogModals() {
        const blogLinks = document.querySelectorAll('.read-more');
        const blogModal = document.getElementById('blog-modal');
        const blogDetails = document.getElementById('blog-details');
        
        if (!blogLinks.length || !blogModal || !blogDetails) return;
        
        blogLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const postKey = link.getAttribute('data-post');
                const postData = blogData[postKey];
                
                if (postData) {
                    blogDetails.innerHTML = this.generateBlogContent(postData);
                    this.openModal(blogModal);
                }
            });
        });
    },
    
    setupCloseButtons() {
        const closeButtons = document.querySelectorAll('.close-modal');
        
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                this.closeModal(modal);
            });
        });
        
        // Закриття по кліку на фон
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
        
        // Закриття по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    this.closeModal(modal);
                });
            }
        });
    },
    
    generatePortfolioContent(project) {
        return `
            <div class="portfolio-modal-content">
                <div class="portfolio-image">
                    <img src="${project.image}" alt="${project.title}">
                </div>
                <div class="portfolio-info">
                    <h2>${project.title}</h2>
                    <p class="portfolio-description">${project.description}</p>
                    
                    <div class="portfolio-details">
                        <div class="portfolio-section">
                            <h3>Технології</h3>
                            <div class="tech-tags">
                                ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                            </div>
                        </div>
                        
                        <div class="portfolio-section">
                            <h3>Виклики</h3>
                            <p>${project.challenges}</p>
                        </div>
                        
                        <div class="portfolio-section">
                            <h3>Рішення</h3>
                            <p>${project.solution}</p>
                        </div>
                        
                        <div class="portfolio-section">
                            <h3>Результати</h3>
                            <p>${project.results}</p>
                        </div>
                    </div>
                    
                    <a href="#" class="portfolio-cta-btn">Замовити схожий проект</a>
                </div>
            </div>
        `;
    },
    
    generateBlogContent(post) {
        return `
            <div class="blog-modal-content">
                <div class="blog-image">
                    <img src="${post.image}" alt="${post.title}">
                </div>
                <div class="blog-info">
                    <h2>${post.title}</h2>
                    <div class="blog-meta">
                        <span class="blog-author"><i class="fas fa-user"></i> ${post.author}</span>
                        <span class="blog-date"><i class="fas fa-calendar-alt"></i> ${post.date}</span>
                    </div>
                    <div class="blog-content">
                        ${post.content}
                    </div>
                    <div class="blog-share">
                        <h4>Поділитися:</h4>
                        <div class="share-buttons">
                            <a href="#" class="share-btn facebook"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" class="share-btn twitter"><i class="fab fa-twitter"></i></a>
                            <a href="#" class="share-btn linkedin"><i class="fab fa-linkedin-in"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    openModal(modal) {
        document.body.style.overflow = 'hidden'; // Заборона прокрутки
        modal.classList.add('active');
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    },
    
    closeModal(modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Відновлення прокрутки
        }, 300);
    }
};

// Обробник для вкладок послуг
const ServiceHandler = {
    init() {
        // Налаштування вкладок фільтрації послуг
        const serviceTabs = document.querySelectorAll('.service-tab');
        if (serviceTabs.length) {
            serviceTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Деактивація всіх вкладок
                    serviceTabs.forEach(t => t.classList.remove('active'));
                    // Активація поточної вкладки
                    tab.classList.add('active');
                    
                    // Отримання категорії фільтра
                    const filter = tab.getAttribute('data-filter');
                    this.filterServices(filter);
                    
                    // Приховуємо деталі послуги при зміні фільтра
                    const serviceDetails = document.getElementById('service-details');
                    if (serviceDetails) {
                        serviceDetails.classList.remove('active');
                        serviceDetails.innerHTML = '';
                    }
                });
            });
        }
        
        // Додавання обробників для кнопок "Дізнатися більше"
        const learnMoreBtns = document.querySelectorAll('.learn-more[data-service]');
        if (learnMoreBtns.length) {
            learnMoreBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const serviceType = btn.getAttribute('data-service');
                    this.showServiceDetail(serviceType);
                    
                    // Прокручуємо до деталей послуги
                    setTimeout(() => {
                        smoothScrollTo('#service-details');
                    }, 300);
                });
            });
        }
    },
    
    // Фільтрація карток послуг
    filterServices(filter) {
        const serviceCards = document.querySelectorAll('.service-card');
        
        serviceCards.forEach(card => {
            if (filter === 'all') {
                card.classList.remove('hidden');
            } else {
                const serviceType = card.getAttribute('data-service');
                if (serviceType === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            }
        });
    },
    
    // Показ детальної інформації про послугу
    showServiceDetail(serviceType, subType = null) {
        const serviceDetails = document.getElementById('service-details');
        if (!serviceDetails) return;
        
        // Генеруємо вміст для різних послуг
        let detailContent = '';
        
        switch (serviceType) {
            case 'web-development':
            case 'web':
                if (subType === 'html-css') {
                    detailContent = this.generateHtmlCssDetail();
                } else if (subType === 'javascript') {
                    detailContent = this.generateJavaScriptDetail();
                } else if (subType === 'cms') {
                    detailContent = this.generateCmsDetail();
                } else {
                    detailContent = this.generateWebDevelopmentDetail();
                }
                break;
            case 'design':
                detailContent = this.generateUiUxDesignDetail();
                break;
            case 'mobile':
                detailContent = this.generateMobileDevelopmentDetail();
                break;
            case 'seo':
                detailContent = this.generateSeoDetail();
                break;
            default:
                detailContent = `<div class="service-detail">
                    <h2>Детальна інформація</h2>
                    <p>Для отримання детальної інформації про цю послугу, зв'яжіться з нами.</p>
                </div>`;
        }
        
        // Заповнюємо контейнер деталей послуги
        serviceDetails.innerHTML = detailContent;
        
        // Показуємо контейнер з анімацією
        setTimeout(() => {
            serviceDetails.classList.add('active');
        }, 100);
    },
    
    // Шаблони для різних типів послуг
    generateWebDevelopmentDetail() {
        return `
            <div class="service-detail">
                <h2>Веб-розробка</h2>
                <p>Ми створюємо сучасні, функціональні та привабливі веб-сайти, які відповідають останнім стандартам веб-розробки. Наша команда професіоналів використовує передові технології, щоб створити рішення, яке найкраще відповідає вашим потребам.</p>
                
                <p>Наш підхід включає:</p>
                <ul>
                    <li>Аналіз потреб та цілей вашого бізнесу</li>
                    <li>Розробку зрозумілої архітектури сайту</li>
                    <li>Адаптивний дизайн для всіх пристроїв</li>
                    <li>Оптимізацію швидкості завантаження</li>
                    <li>SEO-оптимізацію сайту</li>
                    <li>Інтеграцію з CMS для зручного управління контентом</li>
                </ul>
                
                <div class="service-packages">
                    <div class="service-package basic">
                        <div class="package-name">Базовий</div>
                        <div class="package-price">$499 <span>/ проект</span></div>
                        <ul class="package-features">
                            <li>До 5 сторінок</li>
                            <li>Адаптивний дизайн</li>
                            <li>Контактна форма</li>
                            <li>Базова SEO оптимізація</li>
                        </ul>
                        <a href="#contacts" class="package-btn">Замовити</a>
                    </div>
                    
                    <div class="service-package standard">
                        <div class="package-name">Стандарт</div>
                        <div class="package-price">$999 <span>/ проект</span></div>
                        <ul class="package-features">
                            <li>До 10 сторінок</li>
                            <li>Адаптивний дизайн</li>
                            <li>Інтеграція з CMS</li>
                            <li>Розширена SEO оптимізація</li>
                            <li>Аналітика Google Analytics</li>
                        </ul>
                        <a href="#contacts" class="package-btn">Замовити</a>
                    </div>
                    
                    <div class="service-package premium">
                        <div class="package-name">Преміум</div>
                        <div class="package-price">$1999 <span>/ проект</span></div>
                        <ul class="package-features">
                            <li>Необмежена кількість сторінок</li>
                            <li>Індивідуальний дизайн</li>
                            <li>Інтеграція з CRM/ERP</li>
                            <li>Повна SEO оптимізація</li>
                            <li>Інтеграція з соцмережами</li>
                            <li>6 місяців безкоштовної підтримки</li>
                        </ul>
                        <a href="#contacts" class="package-btn">Замовити</a>
                    </div>
                </div>
            </div>
        `;
    },
    
    generateHtmlCssDetail() {
        return `
            <div class="service-detail">
                <h2>HTML/CSS розробка</h2>
                <p>Ми створюємо семантичну HTML-розмітку та сучасні CSS стилі для вашого веб-сайту, забезпечуючи чистий, оптимізований код та візуально привабливий дизайн.</p>
                
                <p>Наші послуги HTML/CSS розробки включають:</p>
                <ul>
                    <li>Чисту, семантичну HTML5 розмітку</li>
                    <li>Сучасні CSS3 стилі з анімаціями</li>
                    <li>Використання Flexbox та Grid для макетів</li>
                    <li>Методологія БЕМ для організації коду</li>
                    <li>Адаптивний дизайн для всіх пристроїв</li>
                    <li>Оптимізація продуктивності</li>
                </ul>
                
                <p>Ми дотримуємося найкращих практик розробки для забезпечення швидкості завантаження, доступності та кросбраузерної сумісності вашого сайту.</p>
                
                <a href="#contacts" class="learn-more">Зв'язатися з нами</a>
            </div>
        `;
    },
    
    generateJavaScriptDetail() {
        return `
            <div class="service-detail">
                <h2>JavaScript розробка</h2>
                <p>Наша команда створює динамічний і інтерактивний веб-контент з використанням найновіших JavaScript технологій та фреймворків.</p>
                
                <p>Наші послуги JavaScript розробки включають:</p>
                <ul>
                    <li>Сучасний ES6+ JavaScript код</li>
                    <li>Розробка на React, Vue.js або Angular</li>
                    <li>Розробка Single Page Applications (SPA)</li>
                    <li>Інтеграція з API та сторонніми сервісами</li>
                    <li>Оптимізація продуктивності фронтенду</li>
                    <li>Тестування і налагодження коду</li>
                </ul>
                
                <p>Ми створюємо не просто функціональні, але й високопродуктивні рішення з чистим, підтримуваним кодом.</p>
                
                <a href="#contacts" class="learn-more">Зв'язатися з нами</a>
            </div>
        `;
    },
    
    generateCmsDetail() {
        return `
            <div class="service-detail">
                <h2>CMS інтеграція і розробка</h2>
                <p>Ми інтегруємо та налаштовуємо системи управління вмістом (CMS), щоб ви могли легко оновлювати свій сайт без технічних знань.</p>
                
                <p>Наші послуги CMS включають:</p>
                <ul>
                    <li>Налаштування та інтеграція WordPress, Drupal, Joomla</li>
                    <li>Розробка користувацьких тем та шаблонів</li>
                    <li>Створення плагінів та модулів</li>
                    <li>Оптимізація швидкості CMS</li>
                    <li>Навчання користувачів роботі з CMS</li>
                    <li>Регулярне оновлення та технічна підтримка</li>
                </ul>
                
                <p>Наші рішення дозволяють вам зосередитись на вашому бізнесі, а не на технічних аспектах управління сайтом.</p>
                
                <a href="#contacts" class="learn-more">Зв'язатися з нами</a>
            </div>
        `;
    },
    
    generateUiUxDesignDetail() {
        return `
            <div class="service-detail">
                <h2>UI/UX Дизайн</h2>
                <p>Ми створюємо інтуїтивно зрозумілі та привабливі інтерфейси, які забезпечують відмінний користувацький досвід та допомагають досягти бізнес-цілей.</p>
                
                <p>Наш процес UI/UX дизайну включає:</p>
                <ul>
                    <li>Дослідження користувачів та аналіз потреб</li>
                    <li>Створення user personas та карти подорожі користувача</li>
                    <li>Розробку wireframes та прототипів</li>
                    <li>Дизайн користувацького інтерфейсу</li>
                    <li>Тестування юзабіліті</li>
                    <li>Ітеративні покращення на основі відгуків</li>
                </ul>
                
                <div class="service-packages">
                    <div class="service-package basic">
                        <div class="package-name">Базовий UI/UX</div>
                        <div class="package-price">$699 <span>/ проект</span></div>
                        <ul class="package-features">
                            <li>Аналіз конкурентів</li>
                            <li>Базове дослідження користувачів</li>
                            <li>Wireframes для 5 екранів</li>
                            <li>UI дизайн для 5 екранів</li>
                        </ul>
                        <a href="#contacts" class="package-btn">Замовити</a>
                    </div>
                    
                    <div class="service-package standard">
                        <div class="package-name">Стандарт</div>
                        <div class="package-price">$1499 <span>/ проект</span></div>
                        <ul class="package-features">
                            <li>Глибоке дослідження користувачів</li>
                            <li>User Personas і User Journey Map</li>
                            <li>Wireframes для 10 екранів</li>
                            <li>UI дизайн для 10 екранів</li>
                            <li>Інтерактивний прототип</li>
                        </ul>
                        <a href="#contacts" class="package-btn">Замовити</a>
                    </div>
                    
                    <div class="service-package premium">
                        <div class="package-name">Преміум</div>
                        <div class="package-price">$2999 <span>/ проект</span></div>
                        <ul class="package-features">
                            <li>Повний UI/UX аудит існуючого продукту</li>
                            <li>Глибоке користувацьке дослідження</li>
                            <li>Необмежена кількість екранів</li>
                            <li>Повний інтерактивний прототип</li>
                            <li>Юзабіліті тестування</li>
                            <li>UI Kit і Design System</li>
                        </ul>
                        <a href="#contacts" class="package-btn">Замовити</a>
                    </div>
                </div>
            </div>
        `;
    },
    
    generateMobileDevelopmentDetail() {
        return `
            <div class="service-detail">
                <h2>Мобільна розробка</h2>
                <p>Ми створюємо нативні та кросплатформні мобільні додатки, які допомагають вашому бізнесу взаємодіяти з клієнтами на новому рівні.</p>
                
                <p>Наші послуги мобільної розробки включають:</p>
                <ul>
                    <li>Розробку нативних додатків для iOS та Android</li>
                    <li>Кросплатформну розробку на React Native або Flutter</li>
                    <li>UI/UX дизайн мобільних інтерфейсів</li>
                    <li>Інтеграцію з API та сторонніми сервісами</li>
                    <li>Тестування та оптимізацію продуктивності</li>
                    <li>Публікацію в App Store та Google Play</li>
                </ul>
                
                <div class="service-packages">
                    <div class="service-package basic">
                        <div class="package-name">Базовий</div>
                        <div class="package-price">$4999 <span>/ проект</span></div>
                        <ul class="package-features">
                            <li>Одна платформа (iOS або Android)</li>
                            <li>До 5 екранів</li>
                            <li>Базова функціональність</li>
                            <li>Інтеграція з API</li>
                        </ul>
                        <a href="#contacts" class="package-btn">Замовити</a>
                    </div>
                    
                    <div class="service-package standard">
                        <div class="package-name">Стандарт</div>
                        <div class="package-price">$9999 <span>/ проект</span></div>
                        <ul class="package-features">
                            <li>Кросплатформний додаток</li>
                            <li>До 10 екранів</li>
                            <li>Середня складність функціоналу</li>
                            <li>Інтеграція з API</li>
                            <li>Аналітика користувачів</li>
                            <li>Push-повідомлення</li>
                        </ul>
                        <a href="#contacts" class="package-btn">Замовити</a>
                    </div>
                    
                    <div class="service-package premium">
                        <div class="package-name">Преміум</div>
                        <div class="package-price">$19999 <span>/ проект</span></div>
                        <ul class="package-features">
                            <li>Нативний додаток для iOS та Android</li>
                            <li>Необмежена кількість екранів</li>
                            <li>Складний користувацький функціонал</li>
                            <li>Інтеграція з декількома API</li>
                            <li>Розширена аналітика</li>
                            <li>Офлайн-режим роботи</li>
                            <li>Публікація в магазинах додатків</li>
                        </ul>
                        <a href="#contacts" class="package-btn">Замовити</a>
                    </div>
                </div>
            </div>
        `;
    },
    
    generateSeoDetail() {
        return `
            <div class="service-detail">
                <h2>SEO оптимізація</h2>
                <p>Ми допомагаємо вашому сайту досягти високих позицій у пошукових системах та збільшити органічний трафік за допомогою професійної SEO-оптимізації.</p>
                
                <p>Наші послуги SEO включають:</p>
                <ul>
                    <li>Аудит та аналіз поточного стану сайту</li>
                    <li>Дослідження ключових слів та конкурентів</li>
                    <li>Оптимізацію технічних аспектів сайту</li>
                    <li>Оптимізацію контенту та метаданих</li>
                    <li>Побудову якісного профілю зворотних посилань</li>
                    <li>Регулярні звіти та моніторинг прогресу</li>
                </ul>
                
                <div class="service-packages">
                    <div class="service-package basic">
                        <div class="package-name">Базовий</div>
                        <div class="package-price">$399 <span>/ місяць</span></div>
                        <ul class="package-features">
                            <li>Аудит сайту</li>
                            <li>Базова оптимізація контенту</li>
                            <li>Оптимізація для 10 ключових слів</li>
                            <li>Щомісячний звіт</li>
                        </ul>
                        <a href="#contacts" class="package-btn">Замовити</a>
                    </div>
                    
                    <div class="service-package standard">
                        <div class="package-name">Стандарт</div>
                        <div class="package-price">$799 <span>/ місяць</span></div>
                        <ul class="package-features">
                            <li>Розширений аудит сайту</li>
                            <li>Повна оптимізація контенту</li>
                            <li>Оптимізація для 30 ключових слів</li>
                            <li>Аналіз конкурентів</li>
                            <li>Базова стратегія лінкбілдингу</li>
                            <li>Щотижневі звіти</li>
                        </ul>
                        <a href="#contacts" class="package-btn">Замовити</a>
                    </div>
                    
                    <div class="service-package premium">
                        <div class="package-name">Преміум</div>
                        <div class="package-price">$1499 <span>/ місяць</span></div>
                        <ul class="package-features">
                            <li>Повний технічний аудит</li>
                            <li>Створення нового SEO-оптимізованого контенту</li>
                            <li>Оптимізація для 50+ ключових слів</li>
                            <li>Повний аналіз конкурентів</li>
                            <li>Агресивна стратегія лінкбілдингу</li>
                            <li>Локальна SEO-оптимізація</li>
                            <li>Оптимізація для голосового пошуку</li>
                            <li>Щотижневі звіти та консультації</li>
                        </ul>
                        <a href="#contacts" class="package-btn">Замовити</a>
                    </div>
                </div>
            </div>
        `;
    }
};

// Ініціалізація
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await MenuHandler.initMenu();
        setupEventListeners();
        
        // Відновлення останньої активної секції або використання хешу URL
        const hash = window.location.hash.slice(1);
        const lastSection = localStorage.getItem('lastSection');
        const sectionToShow = hash || lastSection || 'home';
        
        MenuHandler.showSection(sectionToShow);
        
        // Налаштовуємо IntersectionObserver для анімації появи елементів
        setupIntersectionObserver();
        
        // Ініціалізація модальних вікон
        ModalHandler.init();
        
        // Додаємо обробники для сервісних карток
        setupServiceCards();
        
        // Додаємо анімацію лічильників для статистики
        setupCounterAnimation();
        
        // Нові налаштування
        setupScrollToTopButton();
        setupScrollSpy();
        setupLazyLoading();
        
        // Додаємо лінк для доступності "пропустити до контенту"
        const skipLink = document.createElement('a');
        skipLink.className = 'skip-to-content';
        skipLink.href = '#main-content';
        skipLink.textContent = 'Пропустити до контенту';
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Додаємо обробник для мобільного меню
        setupMobileMenu();
        
        // Ініціалізація обробника для вкладок послуг
        ServiceHandler.init();
        
        // Додатково ініціалізуємо вкладки послуг
        setupServiceTabs();
        
    } catch (error) {
        console.error('Initialization error:', error);
        UI.showError('Помилка ініціалізації додатку');
    }
});

// Обробники подій
function setupEventListeners() {
    // Бургер меню
    const burgerMenu = document.querySelector('.burger-menu');
    burgerMenu?.addEventListener('click', () => {
        AppState.isMenuOpen = !AppState.isMenuOpen;
        UI.toggleMenu(AppState.isMenuOpen);
    });

    // Форма контактів
    document.querySelector('.contact-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('.submit-btn');
        
        const formData = new FormData(form);
        const errors = Validator.validateForm(formData);
        
        if (errors.length) {
            UI.showErrors(errors);
            return;
        }
        
        UI.setSubmitState(submitBtn, true);
        try {
            await API.submitForm(formData);
            UI.showSuccess('Повідомлення надіслано успішно!');
            form.reset();
        } catch (error) {
            UI.showError('Помилка при відправці');
        } finally {
            UI.setSubmitState(submitBtn, false);
        }
    });

    // Навігація клавіатурою
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && AppState.isMenuOpen) {
            UI.toggleMenu(false);
            AppState.isMenuOpen = false;
        }
    });

    // Обробник для кнопки "Замовити схожий проект" в модальних вікнах
    document.addEventListener('click', (e) => {
        if (e.target.matches('.portfolio-cta-btn')) {
            e.preventDefault();
            
            // Закриваємо модальне вікно
            const modal = e.target.closest('.modal');
            ModalHandler.closeModal(modal);
            
            // Прокручуємо до форми контактів
            const contactsSection = document.getElementById('contacts');
            
            if (contactsSection) {
                MenuHandler.showSection('contacts');
                history.pushState({}, '', '#contacts');
                
                setTimeout(() => {
                    // Виділяємо форму для привернення уваги
                    const form = contactsSection.querySelector('.contact-form');
                    if (form) {
                        form.classList.add('highlight');
                        
                        setTimeout(() => {
                            form.classList.remove('highlight');
                        }, 1500);
                    }
                }, 500);
            }
        }
    });
    
    // Обробник для кнопок соціальних мереж
    document.addEventListener('click', (e) => {
        if (e.target.closest('.share-btn') || e.target.closest('.social-links a')) {
            e.preventDefault();
            UI.showSuccess('В повній версії тут буде перехід на сторінку соціальної мережі.');
        }
    });
    
    // Додавання обробників для пакетів послуг
    document.addEventListener('click', (e) => {
        // Обробка кліку на кнопки пакетів послуг
        if (e.target.matches('.package-btn') || e.target.closest('.package-btn')) {
            e.preventDefault();
            
            // Отримуємо інформацію про пакет
            const packageElement = e.target.closest('.service-package');
            const packageName = packageElement.querySelector('.package-name').textContent;
            const packagePrice = packageElement.querySelector('.package-price').textContent;
            
            // Перехід до форми контактів
            MenuHandler.showSection('contacts');
            history.pushState({}, '', '#contacts');
            
            // Заповнюємо форму з інформацією про обраний пакет
            setTimeout(() => {
                const form = document.querySelector('.contact-form');
                const messageField = form.querySelector('textarea[name="message"]');
                
                if (messageField) {
                    messageField.value = `Я цікавлюсь пакетом "${packageName}" за ціною ${packagePrice}.`;
                    form.classList.add('highlight');
                    
                    setTimeout(() => {
                        form.classList.remove('highlight');
                    }, 1500);
                }
            }, 300);
        }
    });
}

// Плавний скрол до секцій
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const sectionId = this.getAttribute('href').slice(1);
        const section = document.getElementById(sectionId);
        
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Анімація появи елементів при скролі
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .portfolio-item, .blog-post').forEach(
    el => observer.observe(el)
);

// Налаштування IntersectionObserver для анімації
function setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    entry.target.style.opacity = 1;
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll('.service-card, .portfolio-item, .blog-post, .feature-card');
        elements.forEach(el => {
            el.style.opacity = 0;
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
}

// Функція для анімації лічильників статистики
function setupCounterAnimation() {
    const stats = document.querySelectorAll('.stat-number');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const value = parseInt(target.textContent);
                    
                    animateCounter(target, 0, value, 2000);
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.5 });
        
        stats.forEach(stat => observer.observe(stat));
    }
}

// Анімація для лічильників
function animateCounter(element, start, end, duration) {
    const originalText = element.textContent;
    const hasPlus = originalText.includes('+');
    
    let startTimestamp = null;
    
    function step(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentValue = Math.floor(progress * (end - start) + start);
        
        element.textContent = hasPlus ? currentValue + '+' : currentValue;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    }
    
    window.requestAnimationFrame(step);
}

// Функція для обробки сервісних карток
function setupServiceCards() {
    const serviceLinks = document.querySelectorAll('.learn-more[data-service]');
    
    serviceLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const service = link.getAttribute('data-service');
            
            // Відображення alert повідомлення (в реальному проекті тут може бути перехід на сторінку послуги)
            UI.showSuccess(`Ви обрали послугу: ${service}. В повній версії тут буде детальна інформація про послугу.`);
        });
    });
}

// Покращений плавний скролінг до елементів
function smoothScrollTo(target, duration = 800) {
    const targetElement = document.querySelector(target);
    if (!targetElement) return;
    
    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Функція пом'якшення для більш природного руху
        const ease = t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        
        window.scrollTo(0, startPosition + distance * ease(progress));
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

// Кнопка "Вгору" з плавною анімацією появи
function setupScrollToTopButton() {
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollToTopBtn.setAttribute('aria-label', 'Прокрутити вгору');
    document.body.appendChild(scrollToTopBtn);
    
    // Показуємо/ховаємо кнопку в залежності від прокрутки
    window.addEventListener('scroll', () => {
        if (window.scrollY > window.innerHeight / 2) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });
    
    // Обробник кліку
    scrollToTopBtn.addEventListener('click', () => {
        smoothScrollTo('body');
    });
}

// Підсвічування поточного розділу в меню при прокрутці
function setupScrollSpy() {
    const sections = document.querySelectorAll('.content-section');
    
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 100; // Додаємо зсув, щоб врахувати меню
        
        sections.forEach(section => {
            if (section.offsetTop <= scrollPos && (section.offsetTop + section.offsetHeight) > scrollPos) {
                // Знаходимо відповідне посилання в меню
                const id = section.getAttribute('id');
                document.querySelectorAll('.menu-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// Функція для відкладеного завантаження зображень
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Функція для налаштування мобільного меню
function setupMobileMenu() {
    const burgerMenu = document.querySelector('.burger-menu');
    const menuList = document.getElementById('menuContainer');
    
    if (burgerMenu && menuList) {
        burgerMenu.addEventListener('click', () => {
            burgerMenu.classList.toggle('active');
            menuList.classList.toggle('active');
            
            // Блокуємо/розблоковуємо скролінг на сторінці
            if (menuList.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Закриваємо меню при кліку поза ним
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-list') && !e.target.closest('.burger-menu')) {
                if (menuList.classList.contains('active')) {
                    burgerMenu.classList.remove('active');
                    menuList.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    }
}

// Удосконалений обробник кліку по посиланнях зі скролінгом
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        
        // Якщо потрібно переключити розділ
        if (targetId && targetId !== '#' && document.querySelector(targetId)) {
            if (targetId.includes('modal')) {
                // Це посилання на модальне вікно, нічого не робимо
            } else if (targetId === '#home' || targetId === '#services' || 
                      targetId === '#portfolio' || targetId === '#blog' || 
                      targetId === '#contacts') {
                // Переключаємо розділ
                MenuHandler.showSection(targetId.slice(1));
                history.pushState({}, '', targetId);
            } else {
                // Просто скролимо до елемента на сторінці
                smoothScrollTo(targetId);
            }
        }
    }
});

// Додатковий код для обробки вкладених підменю
document.addEventListener('DOMContentLoaded', () => {
    // Додаємо обробники для вкладених підменю на мобільних пристроях
    if (window.innerWidth <= 768) {
        const submenus = document.querySelectorAll('.submenu');
        
        submenus.forEach(submenu => {
            const parentItems = submenu.querySelectorAll('.menu-item');
            
            parentItems.forEach(item => {
                const link = item.querySelector('.menu-link');
                const childSubmenu = item.querySelector('.submenu');
                
                if (childSubmenu) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Закриваємо інші відкриті підменю на цьому рівні
                        parentItems.forEach(siblingItem => {
                            if (siblingItem !== item && siblingItem.classList.contains('show-submenu')) {
                                siblingItem.classList.remove('show-submenu');
                            }
                        });
                        
                        // Відкриваємо/закриваємо поточне підменю
                        item.classList.toggle('show-submenu');
                    });
                }
            });
        });
    }
});

// Покращений обробник кліків для сервісних вкладок
function setupServiceTabs() {
    const serviceTabs = document.querySelectorAll('.service-tab');
    const serviceCards = document.querySelectorAll('.service-card');
    
    if (!serviceTabs.length || !serviceCards.length) return;
    
    // Ініціалізуємо активну вкладку
    const activeTab = document.querySelector('.service-tab.active') || serviceTabs[0];
    const filter = activeTab.getAttribute('data-filter');
    
    // Встановлюємо початкову фільтрацію
    ServiceHandler.filterServices(filter);
    
    // Додаємо обробники для всіх вкладок
    serviceTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Знімаємо активний клас з усіх вкладок
            serviceTabs.forEach(t => t.classList.remove('active'));
            
            // Додаємо активний клас до поточної вкладки
            tab.classList.add('active');
            
            // Отримуємо фільтр
            const newFilter = tab.getAttribute('data-filter');
            
            // Фільтруємо сервісні картки
            ServiceHandler.filterServices(newFilter);
            
            // Приховуємо деталі послуги
            const serviceDetails = document.getElementById('service-details');
            if (serviceDetails) {
                serviceDetails.classList.remove('active');
                serviceDetails.innerHTML = '';
            }
        });
    });
}