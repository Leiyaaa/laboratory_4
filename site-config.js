/**
 * Файл конфігурації сайту
 * Містить основні налаштування для різних елементів
 */

const siteConfig = {
    // Загальні налаштування сайту
    site: {
        name: "Web Studio",
        description: "Професійна веб-розробка для вашого бізнесу",
        lang: "uk",
        contact: {
            email: "info@webstudio.com",
            phone: "+380 44 123 45 67",
            address: "м. Київ, вул. Хрещатик, 1"
        },
        social: {
            facebook: "https://facebook.com/webstudio",
            twitter: "https://twitter.com/webstudio",
            instagram: "https://instagram.com/webstudio",
            linkedin: "https://linkedin.com/company/webstudio"
        }
    },
    
    // Налаштування розділів
    sections: {
        hero: {
            title: "Створюємо майбутнє в цифровому світі",
            subtitle: "Інноваційні веб-рішення для вашого бізнесу",
            background: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        },
        features: {
            showSection: true,
            items: [
                {
                    icon: "fas fa-code",
                    title: "Сучасні технології",
                    description: "Використовуємо найновіші технології та фреймворки"
                },
                {
                    icon: "fas fa-mobile-alt",
                    title: "Адаптивний дизайн",
                    description: "Ваш сайт буде чудово виглядати на всіх пристроях"
                },
                {
                    icon: "fas fa-rocket",
                    title: "Швидка розробка",
                    description: "Оптимальні терміни та висока якість виконання"
                }
            ]
        },
        stats: {
            showSection: true,
            items: [
                {
                    number: 100,
                    label: "Реалізованих проектів",
                    hasPlus: true
                },
                {
                    number: 50,
                    label: "Задоволених клієнтів",
                    hasPlus: true
                },
                {
                    number: 5,
                    label: "Років досвіду",
                    hasPlus: true
                }
            ]
        }
    },
    
    // Налаштування анімацій
    animations: {
        enable: true,
        duration: {
            slow: 1000,
            normal: 500,
            fast: 300
        }
    },
    
    // Прапори функціоналу
    features: {
        modals: true,
        lazyLoading: true,
        darkMode: false,
        analytics: false,
        contactForm: true
    }
};

// Експортуємо конфігурацію для використання в інших файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = siteConfig;
} else {
    window.siteConfig = siteConfig;
}
