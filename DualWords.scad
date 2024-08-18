/*
  Some Special Characters for you!!
  ♥
  ☻

*/

/* [Word Options] */

first_word = "WORD1";

second_word = "WORD2";

font = "Arial:style=Bold";

/* [Platform Options] */

thickness = 3.5;

/* [Letter Options] */

// height of letters
height = 25.4;

// spacing between letters as a percentage of height
spacing = .3;

/* [Render Options] */

// smoother renders slower
quality = 8; //[1: Pre-Draft, 2:Draft, 4:Medium, 8:Fine, 16:Ultra Fine]

/* [Hidden] */

// print quality settings
$fa = 12 / quality;
$fs = 2 / quality;

extrude_length = height * 10;
letter_width = height + height * spacing;
platform_radius = sqrt(2 * letter_width ^ 2) / 2;

length = len(first_word);
assert(length == len(second_word), "The strings must have equal lengths.");

module letter(letter, angle) {
    rotate([90, 0, angle])
        translate([0, 0, -extrude_length / 2])
            linear_extrude(extrude_length)
                text(letter, height, halign = "center", font = font);
}

module dual_words() {
    translate([-letter_width * (length - 1) / 2, 0, 0]) {
        for (i = [0 : length - 1]) {
            first_letter = first_word[i];
            second_letter = second_word[i];

            translate([letter_width * i, 0, 0]) {
                intersection() {
                    letter(first_letter, 45);
                    letter(second_letter, -45);
                }
            }
        }

        color("cyan") translate([0, 0, -(thickness - .2)]) {
            hull() {
                cylinder(h = thickness, r = platform_radius);

                translate([letter_width * (length - 1), 0, 0])
                    cylinder(h = thickness, r = platform_radius);
            }
        }
    }
}

echo("Time: ", $t);

rotate([0, 0, 45 - 90 * $t])
    dual_words();
