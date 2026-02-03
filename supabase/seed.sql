-- Seed data for Hangword

-- Insert words with categories and hints
INSERT INTO words (word, category, hint, difficulty) VALUES
-- Animals (Easy)
('ELEPHANT', 'Animals', 'The largest land animal', 1),
('GIRAFFE', 'Animals', 'Has the longest neck', 1),
('PENGUIN', 'Animals', 'A bird that cannot fly but swims well', 1),
('DOLPHIN', 'Animals', 'Intelligent marine mammal', 1),
('BUTTERFLY', 'Animals', 'Insect with colorful wings', 1),
('KANGAROO', 'Animals', 'Australian hopping marsupial', 2),
('OCTOPUS', 'Animals', 'Has eight arms', 2),
('CHEETAH', 'Animals', 'The fastest land animal', 2),

-- Food (Easy-Medium)
('PIZZA', 'Food', 'Italian dish with toppings on dough', 1),
('SPAGHETTI', 'Food', 'Long thin Italian pasta', 2),
('HAMBURGER', 'Food', 'Ground beef sandwich', 1),
('CHOCOLATE', 'Food', 'Sweet treat from cacao beans', 1),
('AVOCADO', 'Food', 'Green fruit used in guacamole', 2),
('SUSHI', 'Food', 'Japanese rice and fish dish', 2),
('CROISSANT', 'Food', 'Flaky French pastry', 3),
('QUINOA', 'Food', 'Ancient grain superfood', 3),

-- Technology (Medium)
('COMPUTER', 'Technology', 'Electronic device for processing data', 2),
('KEYBOARD', 'Technology', 'Input device with keys', 1),
('BLUETOOTH', 'Technology', 'Wireless communication standard', 3),
('ALGORITHM', 'Technology', 'Step-by-step problem solving procedure', 3),
('DATABASE', 'Technology', 'Organized collection of information', 3),
('INTERNET', 'Technology', 'Global network of computers', 2),
('SOFTWARE', 'Technology', 'Programs that run on computers', 2),
('SMARTPHONE', 'Technology', 'Mobile device with apps', 2),

-- Geography (Medium)
('MOUNTAIN', 'Geography', 'Tall natural land formation', 1),
('VOLCANO', 'Geography', 'Mountain that can erupt', 2),
('WATERFALL', 'Geography', 'Water flowing over a cliff', 2),
('PENINSULA', 'Geography', 'Land surrounded by water on three sides', 3),
('ARCHIPELAGO', 'Geography', 'Group of islands', 4),
('CONTINENT', 'Geography', 'Large landmass', 2),
('EQUATOR', 'Geography', 'Imaginary line around Earth', 3),
('HEMISPHERE', 'Geography', 'Half of a sphere or globe', 3),

-- Science (Medium-Hard)
('MOLECULE', 'Science', 'Smallest unit of a compound', 3),
('PHOTOSYNTHESIS', 'Science', 'How plants make food from sunlight', 4),
('GRAVITY', 'Science', 'Force that pulls objects together', 2),
('ELECTRON', 'Science', 'Negatively charged particle', 3),
('CHROMOSOME', 'Science', 'Contains genetic information', 4),
('HYPOTHESIS', 'Science', 'Educated guess in experiments', 3),
('VELOCITY', 'Science', 'Speed in a given direction', 3),
('NUCLEUS', 'Science', 'Center of an atom or cell', 3),

-- Music (Easy-Medium)
('GUITAR', 'Music', 'String instrument with frets', 1),
('SYMPHONY', 'Music', 'Large orchestral composition', 3),
('MELODY', 'Music', 'Sequence of musical notes', 2),
('RHYTHM', 'Music', 'Pattern of beats in music', 2),
('ORCHESTRA', 'Music', 'Large group of musicians', 3),
('SAXOPHONE', 'Music', 'Wind instrument often in jazz', 3),
('HARMONY', 'Music', 'Combination of musical notes', 2),
('ACOUSTIC', 'Music', 'Non-electric sound', 3),

-- Sports (Easy-Medium)
('BASKETBALL', 'Sports', 'Game with hoops and dribbling', 1),
('VOLLEYBALL', 'Sports', 'Game played over a net with hands', 2),
('MARATHON', 'Sports', '26.2 mile race', 2),
('GYMNASTICS', 'Sports', 'Sport with tumbling and apparatus', 3),
('WRESTLING', 'Sports', 'Combat sport with grappling', 2),
('BADMINTON', 'Sports', 'Sport with rackets and shuttlecock', 3),
('TRIATHLON', 'Sports', 'Three-sport endurance event', 3),
('SKATEBOARD', 'Sports', 'Board with wheels for tricks', 2),

-- Movies/Entertainment (Medium)
('ANIMATION', 'Entertainment', 'Moving drawings or graphics', 2),
('DOCUMENTARY', 'Entertainment', 'Non-fiction film genre', 3),
('SCREENPLAY', 'Entertainment', 'Written script for movies', 3),
('CELEBRITY', 'Entertainment', 'Famous person', 2),
('SOUNDTRACK', 'Entertainment', 'Music for a movie', 2),
('BLOCKBUSTER', 'Entertainment', 'Highly successful movie', 3),
('PREMIERE', 'Entertainment', 'First public showing', 3),
('CINEMATOGRAPHY', 'Entertainment', 'Art of making motion pictures', 5),

-- Nature (Easy-Medium)
('RAINBOW', 'Nature', 'Colorful arc after rain', 1),
('LIGHTNING', 'Nature', 'Electric flash during storms', 2),
('AVALANCHE', 'Nature', 'Snow sliding down a mountain', 3),
('EARTHQUAKE', 'Nature', 'Ground shaking event', 2),
('HURRICANE', 'Nature', 'Large rotating storm', 2),
('ECOSYSTEM', 'Nature', 'Community of living things', 3),
('WILDERNESS', 'Nature', 'Untamed natural area', 3),
('ATMOSPHERE', 'Nature', 'Gases surrounding Earth', 3),

-- Miscellaneous (Various)
('ADVENTURE', 'Miscellaneous', 'Exciting journey or experience', 2),
('BEAUTIFUL', 'Miscellaneous', 'Pleasing to the senses', 2),
('DANGEROUS', 'Miscellaneous', 'Full of risk or peril', 2),
('EXCELLENT', 'Miscellaneous', 'Extremely good', 2),
('FANTASTIC', 'Miscellaneous', 'Extraordinarily good', 2),
('WONDERFUL', 'Miscellaneous', 'Inspiring delight', 2),
('KNOWLEDGE', 'Miscellaneous', 'Information and skills acquired', 3),
('MYSTERIOUS', 'Miscellaneous', 'Difficult to understand', 3),
('TOMORROW', 'Miscellaneous', 'The day after today', 1),
('YESTERDAY', 'Miscellaneous', 'The day before today', 2),
('FRIENDSHIP', 'Miscellaneous', 'Bond between friends', 2),
('HAPPINESS', 'Miscellaneous', 'State of joy', 2),
('IMPOSSIBLE', 'Miscellaneous', 'Cannot be done', 3),
('INCREDIBLE', 'Miscellaneous', 'Hard to believe', 2),
('NECESSARY', 'Miscellaneous', 'Required or essential', 3),
('DIFFERENT', 'Miscellaneous', 'Not the same', 2),
('IMPORTANT', 'Miscellaneous', 'Of great significance', 2),
('QUESTION', 'Miscellaneous', 'Sentence seeking information', 2),
('TREASURE', 'Miscellaneous', 'Valuable items or wealth', 2),
('VACATION', 'Miscellaneous', 'Time away from work', 2),
('BIRTHDAY', 'Miscellaneous', 'Anniversary of birth', 1),
('CALENDAR', 'Miscellaneous', 'Shows dates and days', 2),
('LANGUAGE', 'Miscellaneous', 'System of communication', 2),
('UMBRELLA', 'Miscellaneous', 'Protection from rain', 2),
('ALPHABET', 'Miscellaneous', 'Letters of a language', 2),
('BREAKFAST', 'Miscellaneous', 'Morning meal', 2),
('DINOSAUR', 'Miscellaneous', 'Prehistoric reptile', 2),
('PRINCESS', 'Miscellaneous', 'Daughter of royalty', 2),
('UNIVERSE', 'Miscellaneous', 'All of space and everything in it', 3),
('WIZARD', 'Miscellaneous', 'Magical person', 2);

-- Insert daily words for the next 30 days
INSERT INTO daily_words (word_id, play_date)
SELECT
  id,
  CURRENT_DATE + (ROW_NUMBER() OVER (ORDER BY RANDOM()) - 1) * INTERVAL '1 day'
FROM words
ORDER BY RANDOM()
LIMIT 30;
