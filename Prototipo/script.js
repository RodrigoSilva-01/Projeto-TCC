/* =========================================================
   CASA 104
   SCRIPT.JS
   ========================================================= */


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initMobileMenu();

    initSmoothNavigation();

    initScrollSpy();

    initRevealAnimations();

    initDemoButtons();

    initContactForm();

});


/* =========================================================
   MENU MOBILE
   ========================================================= */

function initMobileMenu() {

    const menuButton =
        document.getElementById("menuButton");

    const navigation =
        document.getElementById("navigation");


    if (!menuButton || !navigation) {
        return;
    }


    menuButton.addEventListener("click", () => {

        const isOpen =
            navigation.classList.toggle("open");


        menuButton.classList.toggle(
            "active",
            isOpen
        );


        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );


        menuButton.setAttribute(
            "aria-label",
            isOpen
                ? "Fechar menu"
                : "Abrir menu"
        );

    });


    /* Fechar ao clicar em um link */

    const links =
        navigation.querySelectorAll(".nav-link");


    links.forEach(link => {

        link.addEventListener("click", () => {

            closeMobileMenu();

        });

    });


    /* Fechar clicando fora */

    document.addEventListener("click", event => {

        const clickedInsideMenu =
            navigation.contains(event.target);

        const clickedButton =
            menuButton.contains(event.target);


        if (
            !clickedInsideMenu &&
            !clickedButton &&
            navigation.classList.contains("open")
        ) {

            closeMobileMenu();

        }

    });


    /* Fechar com ESC */

    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            navigation.classList.contains("open")
        ) {

            closeMobileMenu();

        }

    });


    function closeMobileMenu() {

        navigation.classList.remove("open");

        menuButton.classList.remove("active");

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        menuButton.setAttribute(
            "aria-label",
            "Abrir menu"
        );

    }

}


/* =========================================================
   NAVEGAÇÃO SUAVE
   ========================================================= */

function initSmoothNavigation() {

    const links =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    links.forEach(link => {

        link.addEventListener("click", event => {

            const targetId =
                link.getAttribute("href");


            if (
                !targetId ||
                targetId === "#"
            ) {

                return;

            }


            const target =
                document.querySelector(targetId);


            if (!target) {
                return;
            }


            event.preventDefault();


            const header =
                document.getElementById("header");


            const headerHeight =
                header
                    ? header.offsetHeight
                    : 0;


            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight;


            window.scrollTo({

                top: targetPosition,

                behavior: "smooth"

            });

        });

    });

}


/* =========================================================
   MENU ATIVO CONFORME O SCROLL
   ========================================================= */

function initScrollSpy() {

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );


    const navLinks =
        document.querySelectorAll(
            ".nav-link"
        );


    if (
        sections.length === 0 ||
        navLinks.length === 0
    ) {

        return;

    }


    const observer =
        new IntersectionObserver(

            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    const id =
                        entry.target.id;


                    navLinks.forEach(link => {

                        link.classList.remove(
                            "active"
                        );


                        const href =
                            link.getAttribute("href");


                        if (
                            href === `#${id}`
                        ) {

                            link.classList.add(
                                "active"
                            );

                        }

                    });

                });

            },

            {
                rootMargin:
                    "-35% 0px -55% 0px",

                threshold: 0

            }

        );


    sections.forEach(section => {

        observer.observe(section);

    });

}


/* =========================================================
   ANIMAÇÕES DE ENTRADA
   ========================================================= */

function initRevealAnimations() {

    const elements =
        document.querySelectorAll(".reveal");


    if (elements.length === 0) {
        return;
    }


    /* Caso o navegador não suporte IntersectionObserver */

    if (
        !("IntersectionObserver" in window)
    ) {

        elements.forEach(element => {

            element.classList.add("visible");

        });

        return;

    }


    const observer =
        new IntersectionObserver(

            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    entry.target.classList.add(
                        "visible"
                    );


                    observer.unobserve(
                        entry.target
                    );

                });

            },

            {
                threshold: 0.12
            }

        );


    elements.forEach(element => {

        observer.observe(element);

    });

}


/* =========================================================
   BOTÕES QUE AINDA NÃO POSSUEM BACKEND
   ========================================================= */

function initDemoButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-demo]"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();


                showToast(
                    "Essa funcionalidade será conectada ao sistema em breve."
                );

            }
        );

    });

}


/* =========================================================
   FORMULÁRIO DE CONTATO
   ========================================================= */

function initContactForm() {

    const form =
        document.getElementById("contactForm");


    const message =
        document.getElementById("formMessage");


    if (!form) {
        return;
    }


    form.addEventListener("submit", event => {

        event.preventDefault();


        const name =
            document.getElementById("name");

        const email =
            document.getElementById("email");

        const subject =
            document.getElementById("subject");

        const messageInput =
            document.getElementById("message");


        if (
            !name ||
            !email ||
            !subject ||
            !messageInput
        ) {

            return;

        }


        const nameValue =
            name.value.trim();

        const emailValue =
            email.value.trim();

        const messageValue =
            messageInput.value.trim();


        /* VALIDAÇÃO DO NOME */

        if (nameValue.length < 3) {

            showFormMessage(
                "Digite seu nome completo.",
                "error"
            );

            name.focus();

            return;

        }


        /* VALIDAÇÃO DO E-MAIL */

        if (
            !validateEmail(emailValue)
        ) {

            showFormMessage(
                "Digite um e-mail válido.",
                "error"
            );

            email.focus();

            return;

        }


        /* VALIDAÇÃO DA MENSAGEM */

        if (messageValue.length < 10) {

            showFormMessage(
                "Digite uma mensagem com pelo menos 10 caracteres.",
                "error"
            );

            messageInput.focus();

            return;

        }


        /* -----------------------------------------
           SIMULAÇÃO DO ENVIO
        ------------------------------------------ */

        showFormMessage(
            "Mensagem enviada com sucesso!",
            "success"
        );


        showToast(
            "Mensagem enviada com sucesso!"
        );


        form.reset();

    });


    function showFormMessage(
        text,
        type
    ) {

        if (!message) {
            return;
        }


        message.textContent =
            text;


        message.className =
            "form-message";


        message.classList.add(
            type
        );

    }

}


/* =========================================================
   VALIDAÇÃO DE E-MAIL
   ========================================================= */

function validateEmail(email) {

    const regex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    return regex.test(email);

}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer = null;


function showToast(text) {

    const toast =
        document.getElementById("toast");


    if (!toast) {
        return;
    }


    clearTimeout(toastTimer);


    toast.textContent =
        text;


    toast.classList.add("show");


    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 3200);

}
