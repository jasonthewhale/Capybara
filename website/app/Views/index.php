<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/stylesheet.css">

    <script src="script.js"></script>
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

    <div class="background">
        <div class="image-container">
            <a href="<?php echo base_url('tutorial'); ?>">
            <img id="rotating-image" src="img/start_button.png" alt="Your Image">

            </a>
        </div>
    </div>
        
    <footer>
        <div class="footer-content">
            <p>&copy; 2023 Shadow Hunter</p>
        </div>
    </footer>
    

</body>
</html>
    
    
    