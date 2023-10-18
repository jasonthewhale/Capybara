<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/stylesheet.css">
    <script src="script.js"></script>
    <title>Tutorial</title>
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

    <video width="100%" height="720" controls muted>
        <source src="img/tutorial.mp4" type="video/mp4">
    </video>

</body>
</html>