<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/stylesheet.css">
    <script src="../js/script.js"></script>
    <title>Home</title>
</head>

    
<body>

<nav class="navbar">
        <div class="logo">
            <a href="<?php echo base_url('/'); ?>">
                <img src="img/logo.png" alt="Logo"> 
            </a>
        </div>
        <ul class="nav-list">
            <li><a href="<?php echo base_url('tutorial'); ?>">User Guide & User Journey</a></li>
            <li><a href="<?php echo base_url('dark'); ?>">Dark Patterns & Examples</a></li>
            <li><a href="<?php echo base_url('report'); ?>">User Reporting</a></li>
            <li><a href="<?php echo base_url('about'); ?>">About Us </a></li>
        </ul>
    </nav>

    

    <article class="pattern-container">
        <section class="type-select">
            <div class="outer">

                <div id="element1" class="top">
                    <P>COUNTDOWN &nbsp;&nbsp;</P>
                    <div class="circle-top">
                    </div>
                </div>

                <div id="element2" class="top-right">
                    <P> HIDDEN INFO&nbsp; &nbsp;</P>
                    <div class="circle-top-right">
                    </div>
                </div>

                <img id="center-img" src="img/center.png" width="175px">

                <div id="element3" class="center-right" >
                    <P> PRESELECTION</P>
                    <div class="circle-center-right">
                    </div>
                </div>

                <div id="element4" class="bottom-right">
                    <P> POP WINDOW &nbsp;</P>
                    <div class="circle-bottom-right">
                    </div>
                </div>

                <div id="element5" class="bottom">
                    <P> TOY EMOTION &nbsp;</P>
                    <div class="circle-bottom">
                    </div>
                </div>

            </div>

        </section>

        <section id="preselection-info" class="description">
            <div class="type-name">
                Preselection
            </div>

            <div class="type-intro">
            or default effect cognitive bias, is a psychological phenomenon 
            where people tend to choose the option that is already chosen
             for them, even if other choices are available. 
            </div>

            <div class="type-pic">
                <img src="img/preselection.png" style="width:550px;">
            </div>

            <div class="reference">
            blogs.sap.com. (n.d.). How best to use tick-boxes on your opt-in forms | 
            SAP Blogs. [online] Available at: 
            https://blogs.sap.com/2021/06/09/how-best-to-use-tick-boxes-on-your-opt-in-forms/ [Accessed 23 Sep. 2023].
            </div>
        </section>

        <section id="countdown-info" class="description">
            <div class="type-name">
                Countdown
            </div>

            <div class="type-intro">
            When a user is placed under time pressure, they are less able to critically 
            evaluate the information shown to them because they have less time and may experience anxiety or 
            stress. 
            </div>

            <div class="type-pic">
                <img src="img/countdown.png" style="width:550px;">
            </div>

            <div class="reference">
            www.deceptive.design. (n.d.). Deceptive Patterns - Types - Fake urgency. 
            [online] Available at: https://www.deceptive.design/types/fake-urgency.
            </div>
        </section>

        <section id="hiddeninfo-info" class="description">
            <div class="type-name">
                Hidden Information
            </div>

            <div class="type-intro">
            The hidden subscription deceptive pattern typically works by employing some 
            form of sneaking or misdirection. Users think they are buying one thing, 
             in fact they are signing up to a recurring subscription.
            </div>

            <div class="type-pic">
                <img src="img/hiddeninfo.png" style="width:550px;">
            </div>

            <div class="reference">
            Brignull, H. (2010). Deceptive Design – formerly darkpatterns.org. 
            [online] www.deceptive.design. Available at: https://www.deceptive.design/.
            </div>
        </section>

        <section id="popwindow-info" class="description">
            <div class="type-name">
                Pop Window
            </div>

            <div class="type-intro">
            Nagging is a form adversarial resource depletion. 
            Every time an app or a website interrupts the user with a request to
             do something, this depletes the user's time and attention. 
             This is like a tax that the provider imposes on users who do not want to comply 
             with the provider's wishes.
            </div>

            <div class="type-pic">
                <img src="img/popwindow.png" style="width:550px;">
            </div>

            <div class="reference">
            Brignull, H. (2010). Deceptive Design – formerly darkpatterns.org. 
            [online] www.deceptive.design. Available at: https://www.deceptive.design/.
            </div>
        </section>

        <section id="toyemotion-info" class="description">
            <div class="type-name">
                Toying Emotion
            </div>

            <div class="type-intro">
            It refers to the use of language, style, colour, or other elements to evoke 
            a feeling and persuade the user into a particular action. This can 
            include the use of cute or scary images, or enticing or frightening language.
            </div>

            <div class="type-pic">
                <img src="img/toy.png" style="width:550px;">
            </div>

            <div class="reference">
            Brignull, H. (2010). Deceptive Design – formerly darkpatterns.org. 
            [online] www.deceptive.design. Available at: https://www.deceptive.design/.
            </div>
        </section>
        
    </article>

    


    <footer>
        <div class="footer-content">
            <p>&copy; 2023 Shadow Hunter</p>
        </div>
    </footer>

    
    <script>
    //rotate selector
    function getComputedStylesForElements(ids) {
        return ids.map(id => getComputedStyle(document.getElementById(id)));
    }

    const elementIds = ["element1", "element2", "element3", "element4", "element5"];
    const styles = getComputedStylesForElements(elementIds);

    function rotateElements() {
        const styles = getComputedStylesForElements(elementIds);

        const clickedElementId = this.id;
        const clickedElementIndex = elementIds.indexOf(clickedElementId);

        const clickedElementTop = styles[clickedElementIndex].top;

        console.log(`${clickedElementTop}`);

        const top = parseFloat(clickedElementTop);
        const firstElementStyle = { top: styles[0].top, left: styles[0].left };


        for (let i = 0; i < elementIds.length - 1; i++) {
            const currentElement = document.getElementById(elementIds[i]);
            const nextElementStyle = styles[i + 1];

            currentElement.style.top = nextElementStyle.top;
            currentElement.style.left = nextElementStyle.left;
        }

        const lastElement = document.getElementById(elementIds[elementIds.length - 1]);
        lastElement.style.top = firstElementStyle.top;
        lastElement.style.left = firstElementStyle.left;

    }

    for (const elementId of elementIds) {
        document.getElementById(elementId).addEventListener("click", rotateElements);
    }


    //display corresponding content

    const elements = [
        document.getElementById("element1"),
        document.getElementById("element2"),
        document.getElementById("element3"),
        document.getElementById("element4"),
        document.getElementById("element5")
    ];

    const contentSections = [
        document.getElementById("countdown-info"),
        document.getElementById("hiddeninfo-info"),
        document.getElementById("preselection-info"),
        document.getElementById("popwindow-info"),
        document.getElementById("toyemotion-info")
    ];


contentSections[4].style.opacity = 1;
contentSections[4].style.display = "block";
contentSections[0].style.display = "none";


function updateURL(index) {
    const pageName = ["countdown", "hiddeninfo", "preselection", "popwindow", "toyemotion"];
    const newURL = window.location.pathname.split("/").slice(0, -1).join("/") + "/" + pageName[index];
    history.pushState({}, "", newURL);
}

elements.forEach((element, index) => {
    element.addEventListener("click", () => {
        contentSections.forEach((section, sectionIndex) => {
            if (index === sectionIndex) {
                section.style.opacity = 1;
                section.style.display = "block";
            } else {
                section.style.opacity = 0;
                section.style.display = "none";
            }
        });

        elements.forEach((el, idx) => {
            if (index === idx) {
                el.classList.add("selected");
            } else {
                el.classList.remove("selected");
            }
        });
        updateURL(index);


    });
});








    </script>
</body>
</html>
