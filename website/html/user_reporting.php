<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../css/stylesheet.css">
    <script src="../js/script.js"></script>
    <title>Home</title>
</head>

    
<body>

    <nav class="navbar">
        <div class="logo">
            <a href="../html/">
                <img src="../img/logo.png" alt="Logo"> 
            </a>
        </div>
        <ul class="nav-list">
            <li><a href="../html/user_guide.php">User Guide & User Journey</a></li>
            <li><a href="../html/darkpatterns.php">Dark Patterns & Examples</a></li>
            <li><a href="../html/user_reporting.php">User Reporting</a></li>
            <li><a href="../html/aboutUs.php">About Us </a></li>
        </ul>
    </nav>

    <div class="feedback-container">
        <div class="report-title">
            <h1 style="text-align: center">Met a dark pattern ?</h1>
            <h3 style="text-align: center;">Report more! Help more!</h3>

            <div class="return-button hidden">
                <button id="returnHome" >return home</button>
                <button id="submitAnother" >submit another</button>
            </div>  
        </div>

        <div class="feedback-form">
            <form action="<?php echo $_SERVER['PHP_SELF']; ?>" method="POST" enctype="multipart/form-data">
                    <label for="URL">URL:</label>
                    <input type="text" id="URL" name="URL" required>
                    <br>

                    <label for="feedback">Feedback:</label>
                    <textarea id="feedback" name="feedback" rows="4" required></textarea>
                    <br>

                    <label for="image">Upload Image:</label>
                    <input type="file" id="image" name="image" accept="image/*">
                    <br>

                    <button id="cancle" class="submit-button">Cancel</button>
                    <input type="submit" value="Submit" class="submit-button" style="background-color: darkgoldenrod">

                    

            </form>

        </div>

          
    </div>

 

    <?php
        if ($_SERVER["REQUEST_METHOD"] == "POST") {

            if (isset($_FILES["image"])) {
                $uploadDir = "uploads/"; 
                $uploadFile = $uploadDir . basename($_FILES["image"]["name"]); 

                $imageFileType = strtolower(pathinfo($uploadFile, PATHINFO_EXTENSION));
                $allowedExtensions = array("jpg", "jpeg", "png", "gif");
                if (in_array($imageFileType, $allowedExtensions)) {
                    
                    if (move_uploaded_file($_FILES["image"]["tmp_name"], $uploadFile)) {
                        echo "file uploaded successfully!";
                    } else {
                        echo "failed to upload file";
                    }
                } else {
                    echo "only accepted JPG,JPEG,PNG,GIF image format ";
                }
            }
        }       
    ?>

    <div id="popup" class="popup" style="display: none;">
        <p>Thank you for your reporting!</p>
    </div>

    <script>
        const form = document.querySelector('form');
        const popup = document.getElementById('popup');
        const cancle = document.getElementById('cancle');
        const returnHomeButton = document.getElementById('returnHome');
        const submitAnotherButton = document.getElementById('submitAnother');
        const returnButtonContainer = document.querySelector('.return-button');


        form.addEventListener('submit', function (event) {
            event.preventDefault(); 
            popup.style.display = 'block';
            form.classList.add('hidden');


            setTimeout(function () {
                popup.style.display = 'none';
                returnButtonContainer.classList.remove('hidden');

            }, 1500); 

        });

        returnHomeButton.addEventListener('click', function () {
            window.location.href = '../html/'; 
        });

        submitAnotherButton.addEventListener('click', function () {
            window.location.href = '../html/user_reporting.php'; 
        });

        cancle.addEventListener('click', function () {
            window.location.href = '../html/setting.php';
        });
    </script>

    <footer>
        <div class="footer-content">
            <p>&copy; 2023 Shadow Hunter</p>
        </div>
    </footer>

</body>
</html>