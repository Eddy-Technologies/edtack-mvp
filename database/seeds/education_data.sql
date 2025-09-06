INSERT INTO level_types (level_type, description) VALUES
('PRIMARY_1', 'Primary 1'),
('PRIMARY_2', 'Primary 2'),
('PRIMARY_3', 'Primary 3'),
('PRIMARY_4', 'Primary 4'),
('PRIMARY_5', 'Primary 5'),
('PRIMARY_6', 'Primary 6'),
('SECONDARY_1', 'Secondary 1'),
('SECONDARY_2', 'Secondary 2'),
('SECONDARY_3', 'Secondary 3'),
('SECONDARY_4', 'Secondary 4'),
('SECONDARY_5', 'Secondary 5'),
('JUNIOR_COLLEGE_1', 'Junior College 1'),
('JUNIOR_COLLEGE_2', 'Junior College 2');

INSERT INTO syllabus_types (syllabus_type, description) VALUES
('SG_PSLE', 'Singapore PSLE'),
('SG_O_LEVEL', 'Singapore O Level'),
('SG_N_LEVEL', 'Singapore N Level'),
('SG_A_LEVEL', 'Singapore A Level');
-- ('MY_PSLE', 'Malaysia PSLE'),
-- ('MY_SPM', 'Malaysia SPM'),
-- ('MY_STPM', 'Malaysia STPM'),
-- ('US_COMMON_CORE', 'US Common Core'),
-- ('UK_NATIONAL_CURRICULUM', 'UK National Curriculum');


INSERT INTO subjects (name, subject_name, display_name, description, country_code) VALUES
('o_level_singapore_mathematics', 'Mathematics', 'Singapore O Level Mathematics', 'Mathematics for Singapore O Level', 'SG'),
('o_level_singapore_add_math', 'Additional Mathematics', 'Singapore O Level Additional Mathematics', 'Additional Mathematics for Singapore O Level', 'SG'),
('n_level_singapore_add_math', 'Mathematics', 'Singapore O Level Mathematics', 'Mathematics for Singapore O Level', 'SG'),
('lower_secondary_singapore_mathemathics', 'Mathematics', 'Singapore Lower Secondary Mathematics', 'Mathematics for Singapore Lower Secondary shared for o_level and n_level syllabus types', 'SG'),
('o_level_singapore_biology', 'Biology', 'Singapore O Level Biology', 'Biology for Singapore O Level', 'SG'),
('n_level_singapore_biology', 'Biology', 'Singapore N Level Biology', 'Biology for Singapore N Level Academic', 'SG'),
('o_level_singapore_chemistry', 'Chemistry', 'Singapore O Level Chemistry', 'Chemistry for Singapore O Level', 'SG'),
('o_level_singapore_physics', 'Physics', 'Singapore O Level Physics', 'Physics for Singapore O Level', 'SG'),
('o_level_singapore_english', 'English', 'Singapore O Level English', 'English for Singapore O Level', 'SG'),
('o_level_singapore_geography', 'Geography', 'Singapore O Level Geography', 'Geography for Singapore O Level', 'SG'),
('o_level_singapore_history', 'History', 'Singapore O Level History', 'History for Singapore O Level', 'SG'),
('o_level_singapore_social_studies', 'Social Studies', 'Singapore O Level Social Studies', 'Social Studies for Singapore O Level', 'SG');

-- Curriculum Subjects Data for O-Level and N-Level
INSERT INTO curriculum_subjects (level_type, syllabus_type, subject) VALUES
-- O-Level Mathematics (typically for Secondary 3 and 4)
('SECONDARY_3', 'SG_O_LEVEL', 'o_level_singapore_mathematics'),
('SECONDARY_4', 'SG_O_LEVEL', 'o_level_singapore_mathematics'),
-- O-Level Additional Mathematics (typically for Secondary 3 and 4)
('SECONDARY_3', 'SG_O_LEVEL', 'o_level_singapore_add_math'),
('SECONDARY_4', 'SG_O_LEVEL', 'o_level_singapore_add_math'),
-- O-Level Biology (typically for Secondary 3 and 4)
('SECONDARY_3', 'SG_O_LEVEL', 'o_level_singapore_biology'),
('SECONDARY_4', 'SG_O_LEVEL', 'o_level_singapore_biology'),
-- O-Level Chemistry (typically for Secondary 3 and 4)
('SECONDARY_3', 'SG_O_LEVEL', 'o_level_singapore_chemistry'),
('SECONDARY_4', 'SG_O_LEVEL', 'o_level_singapore_chemistry'),
-- O-Level Physics (typically for Secondary 3 and 4)
('SECONDARY_3', 'SG_O_LEVEL', 'o_level_singapore_physics'),
('SECONDARY_4', 'SG_O_LEVEL', 'o_level_singapore_physics'),
-- O-Level English (typically for Secondary 3 and 4)
('SECONDARY_3', 'SG_O_LEVEL', 'o_level_singapore_english'),
('SECONDARY_4', 'SG_O_LEVEL', 'o_level_singapore_english'),
-- O-Level Geography (typically for Secondary 3 and 4)
('SECONDARY_3', 'SG_O_LEVEL', 'o_level_singapore_geography'),
('SECONDARY_4', 'SG_O_LEVEL', 'o_level_singapore_geography'),
-- O-Level History (typically for Secondary 3 and 4)
('SECONDARY_3', 'SG_O_LEVEL', 'o_level_singapore_history'),
('SECONDARY_4', 'SG_O_LEVEL', 'o_level_singapore_history'),
-- O-Level Social Studies (typically for Secondary 3 and 4)
('SECONDARY_3', 'SG_O_LEVEL', 'o_level_singapore_social_studies'),
('SECONDARY_4', 'SG_O_LEVEL', 'o_level_singapore_social_studies'),
-- N-Level Biology (typically for Secondary 3, 4, and 5)
('SECONDARY_3', 'SG_N_LEVEL', 'n_level_singapore_biology'),
('SECONDARY_4', 'SG_N_LEVEL', 'n_level_singapore_biology'),
('SECONDARY_5', 'SG_N_LEVEL', 'n_level_singapore_biology');

-- O-Level Biology Chapters
INSERT INTO chapters (name, display_name, subject_id, level, description) VALUES
('o_level_singapore_biology_00_introduction', 'Introduction', 'o_level_singapore_biology', 1, 'Introduction to Biology'),
('o_level_singapore_biology_chapter_01_cell_structure_and_organization', 'Cell Structure and Organization', 'o_level_singapore_biology', 1, 'Understanding the basic unit of life - cells, their structures and organization'),
('o_level_singapore_biology_chapter_02_movement_of_substances', 'Movement of Substances', 'o_level_singapore_biology', 1, 'How substances move in and out of cells through diffusion, osmosis and active transport'),
('o_level_singapore_biology_chapter_03_biological_molecules', 'Biological Molecules', 'o_level_singapore_biology', 1, 'Study of carbohydrates, proteins, lipids and nucleic acids'),
('o_level_singapore_biology_chapter_04_enzymes', 'Enzymes', 'o_level_singapore_biology', 1, 'Biological catalysts and their role in metabolic processes'),
('o_level_singapore_biology_chapter_05_nutrition_in_humans', 'Nutrition in Humans', 'o_level_singapore_biology', 1, 'Human digestive system and the process of digestion'),
('o_level_singapore_biology_chapter_06_transport_in_humans', 'Transport in Humans', 'o_level_singapore_biology', 1, 'Circulatory system, blood and heart structure and function'),
('o_level_singapore_biology_chapter_07_respiration_in_humans', 'Respiration in Humans', 'o_level_singapore_biology', 1, 'Aerobic and anaerobic respiration, gas exchange in lungs'),
('o_level_singapore_biology_chapter_08_excretion_in_humans', 'Excretion in Humans', 'o_level_singapore_biology', 1, 'Removal of metabolic waste products, kidney structure and function'),
('o_level_singapore_biology_chapter_09_homeostasis_and_hormonal_control', 'Homeostasis and Hormonal Control', 'o_level_singapore_biology', 1, 'Maintaining internal environment, endocrine system and hormones'),
('o_level_singapore_biology_chapter_10_the_nervous_system_and_coordination', 'The Nervous System and Coordination', 'o_level_singapore_biology', 1, 'Structure and function of nervous system, reflexes and voluntary actions'),
('o_level_singapore_biology_chapter_11_infectious_diseases_in_humans', 'Infectious Diseases in Humans', 'o_level_singapore_biology', 1, 'Pathogens, transmission, prevention and immunity'),
('o_level_singapore_biology_chapter_12_the_ecosystem_and_human_impact', 'The Ecosystem and Human Impact', 'o_level_singapore_biology', 1, 'Food chains, nutrient cycles and environmental conservation'),
('o_level_singapore_biology_chapter_13_molecular_genetics', 'Molecular Genetics', 'o_level_singapore_biology', 1, 'DNA structure, protein synthesis and genetic engineering'),
('o_level_singapore_biology_chapter_14_modes_of_reproduction', 'Modes of Reproduction', 'o_level_singapore_biology', 1, 'Asexual and sexual reproduction in organisms'),
('o_level_singapore_biology_chapter_15_reproduction_in_plants', 'Reproduction in Plants', 'o_level_singapore_biology', 1, 'Flower structure, pollination, fertilization and seed dispersal'),
('o_level_singapore_biology_chapter_16_reproduction_in_humans', 'Reproduction in Humans', 'o_level_singapore_biology', 1, 'Human reproductive systems, fertilization and development'),
('o_level_singapore_biology_chapter_17_inheritance', 'Inheritance', 'o_level_singapore_biology', 1, 'Mendelian genetics, variation and natural selection');
-- O-Level Mathematics Chapters
INSERT INTO chapters (name, display_name, subject_id, level, description) VALUES
('o_level_singapore_mathematics_00_introduction_e_math', 'Introduction', 'o_level_singapore_mathematics', 1, 'Introduction to Elementary Mathematics'),
('o_level_singapore_mathematics_numbers_and_operations', 'Numbers and Operations', 'o_level_singapore_mathematics', 1, 'Prime factorization, indices, approximation, and standard form for comprehensive number literacy'),
('o_level_singapore_mathematics_ratio_and_proportion', 'Ratio and Proportion', 'o_level_singapore_mathematics', 1, 'Fundamental relationships between quantities and how they change together including direct and inverse proportion'),
('o_level_singapore_mathematics_percentage', 'Percentage', 'o_level_singapore_mathematics', 1, 'Comparing quantities, calculating changes, and solving real-world financial and statistical problems'),
('o_level_singapore_mathematics_rate_and_speed', 'Rate and Speed', 'o_level_singapore_mathematics', 1, 'Measuring change over time and analyzing motion with speed-time graphs'),
('o_level_singapore_mathematics_algebraic_expressions_and_formulae', 'Algebraic Expressions and Formulae', 'o_level_singapore_mathematics', 1, 'Transition from arithmetic to algebra with expression manipulation and formula rearrangement'),
('o_level_singapore_mathematics_functions_and_graphs', 'Functions and Graphs', 'o_level_singapore_mathematics', 1, 'Mathematical relationships through coordinate systems covering linear and quadratic functions'),
('o_level_singapore_mathematics_equations_and_inequalities', 'Equations and Inequalities', 'o_level_singapore_mathematics', 1, 'Solving for unknown quantities systematically including linear and quadratic equations'),
('o_level_singapore_mathematics_set_language_and_notation', 'Set Language and Notation', 'o_level_singapore_mathematics', 1, 'Mathematical language of sets with operations, relationships, and Venn diagrams'),
('o_level_singapore_mathematics_matrices', 'Matrices', 'o_level_singapore_mathematics', 1, 'Rectangular arrays of numbers for organizing information and mathematical operations'),
('o_level_singapore_mathematics_angles_triangles_and_polygons', 'Angles, Triangles and Polygons', 'o_level_singapore_mathematics', 1, 'Building blocks of shape analysis with angle relationships and polygon properties'),
('o_level_singapore_mathematics_congruence_and_similarity', 'Congruence and Similarity', 'o_level_singapore_mathematics', 1, 'Shape relationships including congruence tests and similarity ratios with scale drawings'),
('o_level_singapore_mathematics_properties_of_circles', 'Properties of Circles', 'o_level_singapore_mathematics', 1, 'Circle theorems, symmetry properties, and angle relationships in circular geometry'),
('o_level_singapore_mathematics_pythagoras_theorem_and_trigonometry', 'Pythagoras Theorem and Trigonometry', 'o_level_singapore_mathematics', 1, 'Calculating unknown lengths and angles in triangles with sine and cosine rules'),
('o_level_singapore_mathematics_mensuration', 'Mensuration', 'o_level_singapore_mathematics', 1, 'Measurement and calculation of area, perimeter, volume, and surface area for geometric shapes'),
('o_level_singapore_mathematics_coordinate_geometry', 'Coordinate Geometry', 'o_level_singapore_mathematics', 1, 'Algebraic methods for geometric relationships using gradients, distances, and line equations'),
('o_level_singapore_mathematics_vectors_in_two_dimensions', 'Vectors in Two Dimensions', 'o_level_singapore_mathematics', 1, 'Vector operations and applications in two-dimensional coordinate systems');

-- O-Level Additional Mathematics Chapters  
INSERT INTO chapters (name, display_name, subject_id, level, description) VALUES
('o_level_singapore_add_math_00_introduction_a_math', 'Introduction', 'o_level_singapore_add_math', 1, 'Introduction to Additional Mathematics'),
('o_level_singapore_add_math_quadratic_functions', 'Quadratic Functions', 'o_level_singapore_add_math', 1, 'Essential properties and applications of quadratic functions with discriminant theory'),
('o_level_singapore_add_math_equations_and_inequalities', 'Equations and Inequalities', 'o_level_singapore_add_math', 1, 'Comprehensive equation solving and inequality analysis using discriminant applications'),
('o_level_singapore_add_math_surds', 'Surds', 'o_level_singapore_add_math', 1, 'Fundamental surds manipulation techniques and rationalization methods for algebraic expressions'),
('o_level_singapore_add_math_polynomials_and_partial_fractions', 'Polynomials and Partial Fractions', 'o_level_singapore_add_math', 1, 'Advanced polynomial manipulation and partial fraction decomposition for higher mathematics'),
('o_level_singapore_add_math_binomial_expansions', 'Binomial Expansions', 'o_level_singapore_add_math', 1, 'Comprehensive binomial theorem applications with factorial notation and expansion techniques'),
('o_level_singapore_add_math_exponential_and_logarithmic_functions', 'Exponential and Logarithmic Functions', 'o_level_singapore_add_math', 1, 'Exponential and logarithmic functions as inverse relationships with practical applications'),
('o_level_singapore_add_math_trigonometric_functions_identities_equations', 'Trigonometric Functions, Identities and Equations', 'o_level_singapore_add_math', 1, 'Advanced trigonometric concepts including compound angles, R-formulae, and systematic equation solving'),
('o_level_singapore_add_math_coordinate_geometry_2d', 'Coordinate Geometry', 'o_level_singapore_add_math', 1, 'Circle equations, point-circle relationships, and analytical geometry techniques'),
('o_level_singapore_add_math_proofs_plane_geometry', 'Proofs in Plane Geometry', 'o_level_singapore_add_math', 1, 'Rigorous geometric proof techniques using established theorems and logical reasoning'),
('o_level_singapore_add_math_differentiation_and_integration', 'Differentiation and Integration', 'o_level_singapore_add_math', 1, 'Fundamental calculus tools for analyzing change and accumulation with practical applications');

-- O-Level Chemistry Chapters
INSERT INTO chapters (name, display_name, subject_id, level, description) VALUES
('o_level_singapore_chemistry_00_introduction_chemistry', 'Introduction', 'o_level_singapore_chemistry', 1, 'Introduction to Chemistry'),
('o_level_singapore_chemistry_experimental_chemistry', 'Experimental Chemistry', 'o_level_singapore_chemistry', 1, 'Precision, accuracy, and safety in chemical experimentation with purification techniques'),
('o_level_singapore_chemistry_the_particulate_nature_of_matter', 'The Particulate Nature of Matter', 'o_level_singapore_chemistry', 1, 'Kinetic particle theory linking macroscopic properties to microscopic behavior and atomic structure'),
('o_level_singapore_chemistry_chemical_bonding_and_structure', 'Chemical Bonding and Structure', 'o_level_singapore_chemistry', 1, 'How atoms combine through ionic, covalent, and metallic bonding to determine material properties'),
('o_level_singapore_chemistry_chemical_calculations', 'Chemical Calculations', 'o_level_singapore_chemistry', 1, 'Quantitative chemistry including mole concept, stoichiometry, and concentration calculations'),
('o_level_singapore_chemistry_acid_base_chemistry', 'Acid Base Chemistry', 'o_level_singapore_chemistry', 1, 'Nature of acids and bases, their reactions, neutralization, and industrial applications'),
('o_level_singapore_chemistry_qualitative_analysis', 'Qualitative Analysis', 'o_level_singapore_chemistry', 1, 'Identifying unknown substances through systematic chemical testing for gases, cations, and anions'),
('o_level_singapore_chemistry_redox_chemistry', 'Redox Chemistry', 'o_level_singapore_chemistry', 1, 'Oxidation and reduction reactions, electron transfer, and electrochemical applications'),
('o_level_singapore_chemistry_patterns_in_the_periodic_table', 'Patterns in the Periodic Table', 'o_level_singapore_chemistry', 1, 'Periodic trends, group properties, and using element positions to predict characteristics'),
('o_level_singapore_chemistry_chemical_energetics', 'Chemical Energetics', 'o_level_singapore_chemistry', 1, 'Energy changes in chemical reactions including exothermic and endothermic processes'),
('o_level_singapore_chemistry_rate_of_reactions', 'Rate of Reactions', 'o_level_singapore_chemistry', 1, 'Factors controlling reaction speeds with collision theory and catalyst mechanisms'),
('o_level_singapore_chemistry_organic_chemistry', 'Organic Chemistry', 'o_level_singapore_chemistry', 1, 'Carbon-based compounds including hydrocarbons, functional groups, and synthesis pathways'),
('o_level_singapore_chemistry_maintaining_air_quality', 'Maintaining Air Quality', 'o_level_singapore_chemistry', 1, 'Atmospheric composition, pollution sources, environmental impacts, and air quality strategies');

-- O-Level Physics Chapters
INSERT INTO chapters (name, display_name, subject_id, level, description) VALUES
('o_level_singapore_physics_00_introduction_physics', 'Introduction', 'o_level_singapore_physics', 1, 'Introduction to Physics'),
('o_level_singapore_physics_physical_quantities_units_and_measurements', 'Physical Quantities, Units and Measurements', 'o_level_singapore_physics', 1, 'Measurement framework, SI units, vector analysis, and error assessment for physics calculations'),
('o_level_singapore_physics_kinematics', 'Kinematics', 'o_level_singapore_physics', 1, 'Motion analysis through mathematical descriptions of position, velocity, and acceleration'),
('o_level_singapore_physics_dynamics', 'Dynamics', 'o_level_singapore_physics', 1, 'Relationship between forces and motion establishing Newton''s laws as fundamental principles'),
('o_level_singapore_physics_turning_effect_of_forces', 'Turning Effect of Forces', 'o_level_singapore_physics', 1, 'Rotational motion, equilibrium conditions, and stability concepts around pivot points'),
('o_level_singapore_physics_pressure', 'Pressure', 'o_level_singapore_physics', 1, 'Pressure as force per unit area with applications in hydraulic systems and fluid statics'),
('o_level_singapore_physics_energy', 'Energy', 'o_level_singapore_physics', 1, 'Energy stores, transfer pathways, conservation principles, and renewable energy comparisons'),
('o_level_singapore_physics_kinetic_particle_model_of_matter', 'Kinetic Particle Model of Matter', 'o_level_singapore_physics', 1, 'Microscopic view explaining macroscopic properties through particle behavior and motion'),
('o_level_singapore_physics_thermal_processes', 'Thermal Processes', 'o_level_singapore_physics', 1, 'Heat transfer mechanisms including conduction, convection, and radiation in various applications'),
('o_level_singapore_physics_thermal_properties_of_matter', 'Thermal Properties of Matter', 'o_level_singapore_physics', 1, 'Matter response to thermal energy through temperature variations and phase transitions'),
('o_level_singapore_physics_general_wave_properties', 'General Wave Properties', 'o_level_singapore_physics', 1, 'Wave fundamentals, energy transfer, and acoustic phenomena including ultrasound applications'),
('o_level_singapore_physics_electromagnetic_spectrum', 'Electromagnetic Spectrum', 'o_level_singapore_physics', 1, 'Electromagnetic waves across frequency ranges with applications and biological safety considerations'),
('o_level_singapore_physics_light', 'Light', 'o_level_singapore_physics', 1, 'Light behavior through reflection, refraction, and optical instruments with geometric optics principles'),
('o_level_singapore_physics_static_electricity', 'Static Electricity', 'o_level_singapore_physics', 1, 'Electrostatic phenomena, electric fields, charging mechanisms, and practical safety applications'),
('o_level_singapore_physics_current_of_electricity', 'Current of Electricity', 'o_level_singapore_physics', 1, 'Electric current fundamentals, circuit analysis, and electrical resistance with temperature effects'),
('o_level_singapore_physics_dc_circuits', 'DC Circuits', 'o_level_singapore_physics', 1, 'Direct current circuit analysis with series and parallel combinations');

-- O-Level English Chapters
INSERT INTO chapters (name, display_name, subject_id, level, description) VALUES
('o_level_singapore_english_00_introduction_english', 'Introduction', 'o_level_singapore_english', 1, 'Introduction to English'),
('o_level_singapore_english_english_vocabulary_bank', 'English Vocabulary Bank', 'o_level_singapore_english', 1, 'Comprehensive vocabulary resource for descriptive language and advanced expressions across all text types'),
('o_level_singapore_english_essay_narrative_techniques', 'Essay Narrative Techniques', 'o_level_singapore_english', 1, 'Sophisticated personal recount techniques through engaging narrative elements and character development'),
('o_level_singapore_english_essay_argumentative_techniques', 'Essay Argumentative Techniques', 'o_level_singapore_english', 1, 'Advanced persuasive writing techniques with PEEL paragraph structures and thesis development'),
('o_level_singapore_english_essay_discursive_techniques', 'Essay Discursive Techniques', 'o_level_singapore_english', 1, 'Multi-perspective analysis techniques for balanced discussion and objective viewpoint exploration'),
('o_level_singapore_english_narrative_writing_structure', 'Narrative Writing Structure', 'o_level_singapore_english', 1, 'Comprehensive framework for constructing engaging personal recounts and story essays'),
('o_level_singapore_english_argumentative_writing_structure', 'Argumentative Writing Structure', 'o_level_singapore_english', 1, 'Systematic guidance for constructing persuasive academic arguments with logical reasoning'),
('o_level_singapore_english_discursive_writing_structure', 'Discursive Writing Structure', 'o_level_singapore_english', 1, 'Framework for balanced essay exploration maintaining objectivity and synthesis thinking'),
('o_level_singapore_english_paragraph_structure_techniques', 'Paragraph Structure Techniques', 'o_level_singapore_english', 1, 'Systematic PEEL framework for constructing well-developed analytical paragraphs'),
('o_level_singapore_english_formal_letter_writing', 'Formal Letter Writing', 'o_level_singapore_english', 1, 'Professional communication including request letters, complaints, and business correspondence'),
('o_level_singapore_english_speech_writing_and_delivery', 'Speech Writing and Delivery', 'o_level_singapore_english', 1, 'Structured guidance for award ceremonies, presentations, and formal speaking occasions');

-- O-Level Geography Chapters
INSERT INTO chapters (name, display_name, subject_id, level, description) VALUES
('o_level_singapore_geography_00_introduction_geography', 'Introduction', 'o_level_singapore_geography', 1, 'Introduction to Geography'),
('o_level_singapore_geography_thinking_geographically', 'Thinking Geographically', 'o_level_singapore_geography', 1, 'Geographic thinking and spatial relationships including human-environment interactions'),
('o_level_singapore_geography_sustainable_development', 'Sustainable Development', 'o_level_singapore_geography', 1, 'Community development while maintaining environmental and social balance for future generations'),
('o_level_singapore_geography_geographical_methods', 'Geographical Methods', 'o_level_singapore_geography', 1, 'Systematic geographic inquiry through fieldwork, data collection, and analytical techniques'),
('o_level_singapore_geography_tourism_activity', 'Tourism Activity', 'o_level_singapore_geography', 1, 'Tourism system components and factors enabling tourism growth and destination development'),
('o_level_singapore_geography_tourism_development', 'Tourism Development', 'o_level_singapore_geography', 1, 'Complex impacts of tourism development on economic, social, and environmental systems'),
('o_level_singapore_geography_sustainable_tourism_development', 'Sustainable Tourism Development', 'o_level_singapore_geography', 1, 'Tourism approaches minimizing negative impacts while maximizing stakeholder benefits'),
('o_level_singapore_geography_weather_and_climate', 'Weather and Climate', 'o_level_singapore_geography', 1, 'Atmospheric system fundamentals with temperature, precipitation, and wind pattern analysis'),
('o_level_singapore_geography_climate_change', 'Climate Change', 'o_level_singapore_geography', 1, 'Global climate change causes, evidence, impacts on natural and human systems'),
('o_level_singapore_geography_climate_action', 'Climate Action', 'o_level_singapore_geography', 1, 'Climate action strategies including adaptation, mitigation, and extreme weather responses');

-- O-Level History Chapters
INSERT INTO chapters (name, display_name, subject_id, level, description) VALUES
('o_level_singapore_history_00_introduction_history', 'Introduction', 'o_level_singapore_history', 1, 'Introduction to History'),
('o_level_singapore_history_extension_of_european_control_british_malaya', 'Extension of European Control: British Malaya', 'o_level_singapore_history', 1, 'British intervention in Malaya during 1870s-1920s and transformation impacts on local societies'),
('o_level_singapore_history_extension_of_european_control_dutch_indonesia', 'Extension of European Control: Dutch Indonesia', 'o_level_singapore_history', 1, 'Dutch colonial expansion in Indonesia during 1870s-1920s with focus on administrative policies'),
('o_level_singapore_history_extension_of_european_control_french_vietnam', 'Extension of European Control: French Vietnam', 'o_level_singapore_history', 1, 'French colonial expansion in Vietnam from 1840s-1890s including intervention motivations and impacts'),
('o_level_singapore_history_after_world_war_i_paris_peace_conference', 'After World War I: Paris Peace Conference', 'o_level_singapore_history', 1, 'Post-WWI peace settlement, League of Nations establishment, and collective security attempts'),
('o_level_singapore_history_rise_of_authoritarian_regimes_nazi_germany', 'Rise of Authoritarian Regimes: Nazi Germany', 'o_level_singapore_history', 1, 'Nazi Germany rise during 1920s-1930s through Weimar Republic weaknesses and Hitler''s consolidation'),
('o_level_singapore_history_rise_of_authoritarian_regimes_militarist_japan', 'Rise of Authoritarian Regimes: Militarist Japan', 'o_level_singapore_history', 1, 'Japanese militarism rise during 1920s-1930s through democratic weaknesses and ultranationalist appeal'),
('o_level_singapore_history_war_in_europe_outbreak_wwii', 'War in Europe: Outbreak of WWII', 'o_level_singapore_history', 1, 'Key developments leading to WWII outbreak in Europe including appeasement failures and Hitler''s strategy'),
('o_level_singapore_history_war_in_asia_pacific_outbreak_wwii', 'War in Asia-Pacific: Outbreak of WWII', 'o_level_singapore_history', 1, 'Developments leading to Pacific War including Japanese expansionism and Pearl Harbor attack'),
('o_level_singapore_history_end_of_world_war_ii', 'End of World War II', 'o_level_singapore_history', 1, 'Allied victory factors and Axis defeat causes in both European and Asia-Pacific theaters'),
('o_level_singapore_history_cold_war_origins_and_development_in_europe', 'Cold War: Origins and Development in Europe', 'o_level_singapore_history', 1, 'Cold War origins 1945-1955 through superpower emergence and European division'),
('o_level_singapore_history_cold_war_korean_war', 'Cold War: Korean War', 'o_level_singapore_history', 1, 'Korean War 1950-1953 as Cold War extension with superpower involvement in civil conflict'),
('o_level_singapore_history_cold_war_vietnam_war', 'Cold War: Vietnam War', 'o_level_singapore_history', 1, 'Vietnam War 1954-1975 as Cold War case study with lasting impacts on international relations'),
('o_level_singapore_history_decolonisation_british_malaya', 'Decolonisation: British Malaya', 'o_level_singapore_history', 1, 'British Malaya decolonization 1945-1957 through constitutional development and political cooperation'),
('o_level_singapore_history_decolonisation_dutch_indonesia', 'Decolonisation: Dutch Indonesia', 'o_level_singapore_history', 1, 'Dutch Indonesia decolonization 1945-1949 through independence struggle and colonial responses'),
('o_level_singapore_history_decolonisation_french_vietnam', 'Decolonisation: French Vietnam', 'o_level_singapore_history', 1, 'French Vietnam decolonization 1945-1954 through armed resistance and international involvement'),
('o_level_singapore_history_end_of_cold_war', 'End of Cold War', 'o_level_singapore_history', 1, 'Cold War conclusion 1980s-1991 through USSR decline and peaceful transition to post-Cold War order');

-- O-Level Social Studies Chapters
INSERT INTO chapters (name, display_name, subject_id, level, description) VALUES
('o_level_singapore_social_studies_00_introduction_social_studies', 'Introduction', 'o_level_singapore_social_studies', 1, 'Introduction to Social Studies'),
('o_level_singapore_social_studies_challenges_in_deciding_what_is_good_for_society', 'Challenges in Deciding What is Good for Society', 'o_level_singapore_social_studies', 1, 'Fundamental challenges governments face when making decisions for collective societal good'),
('o_level_singapore_social_studies_ideas_shaping_good_governance', 'Ideas Shaping Good Governance', 'o_level_singapore_social_studies', 1, 'Fundamental principles that shape effective governance including leadership, anticipating change, and meritocracy'),
('o_level_singapore_social_studies_role_of_government_in_working_for_societys_good', 'Role of Government in Working for Society''s Good', 'o_level_singapore_social_studies', 1, 'Critical government responsibilities including maintaining order, ensuring justice, and providing services'),
('o_level_singapore_social_studies_role_of_citizens_in_working_for_societys_good', 'Role of Citizens in Working for Society''s Good', 'o_level_singapore_social_studies', 1, 'How citizens actively contribute to societal well-being through participation and responsibility'),
('o_level_singapore_social_studies_factors_shaping_identity_and_contributing_to_diversity', 'Factors Shaping Identity and Contributing to Diversity', 'o_level_singapore_social_studies', 1, 'Multiple factors that shape individual and collective identities in Singapore''s diverse society'),
('o_level_singapore_social_studies_reasons_for_greater_diversity_in_singapore', 'Reasons for Greater Diversity in Singapore', 'o_level_singapore_social_studies', 1, 'Historical, economic, and policy factors that created and sustained Singapore''s multicultural society'),
('o_level_singapore_social_studies_experiences_and_effects_of_living_in_a_diverse_society', 'Experiences and Effects of Living in a Diverse Society', 'o_level_singapore_social_studies', 1, 'Daily lived experiences and societal impacts of diversity including benefits and challenges'),
('o_level_singapore_social_studies_challenges_in_a_diverse_society', 'Challenges in a Diverse Society', 'o_level_singapore_social_studies', 1, 'Difficulties and tensions that arise in diverse societies including prejudice and resource competition'),
('o_level_singapore_social_studies_management_of_sociocultural_diversity', 'Management of Sociocultural Diversity', 'o_level_singapore_social_studies', 1, 'Strategies and policies for managing cultural and social differences through integration approaches'),
('o_level_singapore_social_studies_management_of_socioeconomic_diversity', 'Management of Socioeconomic Diversity', 'o_level_singapore_social_studies', 1, 'Addressing income inequality and socioeconomic disparities through policy interventions and social support'),
('o_level_singapore_social_studies_globalization', 'Globalization', 'o_level_singapore_social_studies', 1, 'Increasing interconnectedness of countries through economic, technological, political, and cultural exchanges'),
('o_level_singapore_social_studies_economic_impacts_of_globalization', 'Economic Impacts of Globalization', 'o_level_singapore_social_studies', 1, 'How globalization transforms economies at national, corporate, and individual levels'),
('o_level_singapore_social_studies_cultural_impacts_of_globalization', 'Cultural Impacts of Globalization', 'o_level_singapore_social_studies', 1, 'How global interconnectedness transforms cultural practices, values, and identities worldwide'),
('o_level_singapore_social_studies_managing_security_challenges_in_a_globalized_world', 'Managing Security Challenges in a Globalized World', 'o_level_singapore_social_studies', 1, 'Security threats from global interconnectedness and strategies for addressing them effectively');

-- N-Level Biology Chapters (based on 7 key themes)
-- example for different chapters for n_level_singapore_biology and o_level_singapore_biology
INSERT INTO chapters (name, display_name, subject_id, level, description) VALUES
('n_level_singapore_biology_01_the_cell', 'The Cell', 'n_level_singapore_biology', 1, 'Diverse life forms are similar in that their basic unit are cells'),
('n_level_singapore_biology_02_structure_and_function', 'Structure and Function', 'n_level_singapore_biology', 1, 'Structure and function of organisms from the molecular to the organ system levels are related to each other'),
('n_level_singapore_biology_03_systems', 'Systems', 'n_level_singapore_biology', 1, 'Biological systems interact among themselves and with the environment resulting in the flow of energy and nutrients'),
('n_level_singapore_biology_04_energy', 'Energy', 'n_level_singapore_biology', 1, 'To ensure survival, living organisms obtain, transform and utilise energy from the external world'),
('n_level_singapore_biology_05_homeostasis', 'Homeostasis, Co-ordination and Response', 'n_level_singapore_biology', 1, 'Living organisms detect changes both from the surrounding environment and within themselves so that they are able to respond to these changes to maintain a constant internal environment needed for sustaining life'),
('n_level_singapore_biology_06_heredity', 'Heredity', 'n_level_singapore_biology', 1, 'Genetic information is passed down from parents to offspring during reproduction to ensure the continuity of life'),
('n_level_singapore_biology_07_evolution', 'Evolution', 'n_level_singapore_biology', 1, 'The diversity of living organisms is achieved through a process of evolution, driven by mechanisms such as natural selection');
