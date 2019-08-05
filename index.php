<!doctype html>
<head>
    <meta charset="utf-8">
    <title>Testing data fetch</title>
    <meta name="description" content="Testing data fetch">
    <meta name="author" content="Company">
    <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.5/css/bulma.min.css'/>
    <!-- <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/fontawesome.min.css'/> -->
    <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.min.css'/>
    <link rel='stylesheet' type='text/css' href='main.css' />
    <!-- <link rel='stylesheet' type='text/css' href='debug.css' /> -->
</head>
<body>

<?php
$data = file_get_contents("products.json");
$data = json_decode($data, true);

$counter = 0;
$columnsPerRow = 3;

$totalResults = count($data);

// Used to figure out if we will have an odd remainder of one which
// we won't want to extend the column full-width (2 columns remaining looks okay though).
$columnRemainder = $totalResults % $columnsPerRow;
echo $columnRemainder;
?>
<div class="container" style="padding: 50px 25px;">
    <div class="columns">
        <div class="column has-text-centered">
            <h1 class="title">Testing Data fetch</h1>
            <div class="subtitle" style="margin-bottom: 24px;"><span><?php echo $totalResults; ?></span> Results from NewEgg's Daily Deals Page</div>
        </div>
    </div>

        <?php 
            $index = 0;
            foreach($data as $row) {
                if ($row["oldPrice"] != null) {
                    $oldPrice = $row["oldPrice"];
                    $oldPrice = preg_replace("/[^0-9.]/", "", $oldPrice);
                    $showDollarSignOld = "$";
                } else { $oldPrice = null; $showDollarSignOld = null;}
                if ($row["newPrice"] != null) {
                    $newPrice = $row["newPrice"];
                    $newPrice = preg_replace("/\([^)]+\)/","",$newPrice); // removes paretheses and content in between
                    $newPrice = preg_replace("/[^0-9.]/", "", $newPrice);
                    $showDollarSignNew = "$";
                } else {$newPrice = null; $showDollarSignNew = null;}

                if($counter == 0) {
                    echo '<div class="columns">';
                }
                // echo $index . ' ' . $totalResults;
                if ($index == $totalResults -1 && $columnRemainder == 1) {
                    echo '<div class="column is-one-third" style="padding:0 !important;">';
                } else {
                    echo '<div class="column" style="padding:0 !important;">';
                }
                    echo '<div class="card">';
                        echo '<div class="card-image">';
                            echo '<figure class="image">';
                                echo '<img src="'. $row["image"] . '" alt="Placeholder image">';
                            echo '</figure>';
                        echo '</div>';
                        echo '<div class="card-content" style="padding-top:0;">';
                            echo '<p class="subtitle">' . $row["title"] .'</p>';
                            if($newPrice == null && $oldPrice == null) {
                                echo '<p class="has-text-centered notification is-danger">Sold out</p>';
                            }
                            echo '<i class="far fa-star rating"></i>';
                            echo '<p class="has-text-right price-old"><small>' . $showDollarSignOld . $oldPrice . '</small></p>';
                            echo '<p class="has-text-right price-new">' . $showDollarSignNew . $newPrice .'</p>';
                            if ($oldPrice != null) {
                                // echo $oldPrice . ' - ' . $newPrice;
                                $valueOffOriginal = $oldPrice - $newPrice;
                                echo '<p class="has-text-right price-save">Save $' . $valueOffOriginal .'</p>';
                            } 
                        echo '</div>';
                    echo '</div>';
                echo '</div>';

                $index++;
                $counter++;
                     
                if ($counter >= $columnsPerRow) {
                    echo '</div>';
                    $counter = 0;
                }
            }
        ?>

    </div>


</body>
</html>