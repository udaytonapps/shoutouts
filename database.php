<?php

// The SQL to uninstall this tool
$DATABASE_UNINSTALL = array();

/** Table names */
$SHOUTOUTS_CONFIGURATION_TABLE_NAME = "{$CFG->dbprefix}shoutouts_configuration";
$SHOUTOUTS_INSTANCE_TABLE_NAME = "{$CFG->dbprefix}shoutouts_instance";
$SHOUTOUTS_TYPE_TABLE_NAME = "{$CFG->dbprefix}shoutouts_type";
$SHOUTOUTS_INSTRUCTOR_OPTION_TABLE_NAME = "{$CFG->dbprefix}shoutouts_instructor_option";
$SHOUTOUTS_TYPE_EXCLUSION_TABLE_NAME = "{$CFG->dbprefix}shoutouts_type_exclusion";

/** Table schemas */

$SHOUTOUTS_CONFIGURATION = "CREATE TABLE {$SHOUTOUTS_CONFIGURATION_TABLE_NAME} (

    /* PRIMARY KEY */
    configuration_id        INTEGER NOT NULL AUTO_INCREMENT,
    
    /* COMMON COLS */
    user_id                 INTEGER, /* The original creator - used for notifications if not roster data exists */
    context_id              INTEGER, /* Tracked and scoped, this is the course */
    link_id                 INTEGER, /* Tracked but not scoped, this is the instance */
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    /* CONFIGURATION COLS */
    comments_required       BOOLEAN NOT NULL,
    moderation_enabled      BOOLEAN NOT NULL,
    anonymous_enabled       BOOLEAN NOT NULL,
    recipient_view_enabled  BOOLEAN NOT NULL,
    leaderboard_enabled     BOOLEAN NOT NULL,
    awarded_value           INTEGER, -- NULLABLE?
    awarded_limit           INTEGER, -- NULLABLE?
    awarded_cooldown        INTEGER, -- NULLABLE?
    received_value          INTEGER, -- NULLABLE?
    received_limit          INTEGER, -- NULLABLE?
    received_cooldown       INTEGER, -- NULLABLE?

    PRIMARY KEY(configuration_id)

) ENGINE = InnoDB DEFAULT CHARSET=utf8";

$SHOUTOUTS_INSTANCE = "CREATE TABLE {$SHOUTOUTS_INSTANCE_TABLE_NAME} (

    /* PRIMARY KEY */
    award_instance_id       INTEGER NOT NULL AUTO_INCREMENT,
    
    /* COMMON COLS */
    context_id              INTEGER NOT NULL, /* Tracked and scoped, this is the course */
    link_id                 INTEGER NOT NULL, /* Tracked but not scoped, this is the instance */
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    /* TEMPLATE COMMENT COLS */
    sender_id               INTEGER NOT NULL, /* ID of the learner who sent it */
    recipient_id            TEXT NOT NULL, /* ID of the learner who received it */
    award_type_id           INTEGER NOT NULL, /* ID of the associated award type */
    award_status            TEXT NOT NULL,
    sender_comment          TEXT,
    moderation_comment      TEXT,
    instructor_id           INTEGER,
    status_updated_at       TIMESTAMP,

    PRIMARY KEY(award_instance_id)

) ENGINE = InnoDB DEFAULT CHARSET=utf8";

$SHOUTOUTS_TYPE = "CREATE TABLE {$SHOUTOUTS_TYPE_TABLE_NAME} (

    /* PRIMARY KEY */
    award_type_id           INTEGER NOT NULL AUTO_INCREMENT,
    
    /* COMMON COLS */
    context_id              INTEGER, /* Tracked and scoped, this is the course */
    link_id                 INTEGER, /* Tracked but not scoped, this is the instance */
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    /* TEMPLATE COMMENT COLS */
    image_url               TEXT NOT NULL,
    label                   TEXT NOT NULL,
    short_description       TEXT NOT NULL,
    is_active               BOOLEAN DEFAULT 1, /* Defaulting to active */

    PRIMARY KEY(award_type_id)

) ENGINE = InnoDB DEFAULT CHARSET=utf8";

$SHOUTOUTS_INSTRUCTOR_OPTION = "CREATE TABLE {$SHOUTOUTS_INSTRUCTOR_OPTION_TABLE_NAME} (

    /* PRIMARY KEY */
    option_id               INTEGER NOT NULL AUTO_INCREMENT,
    
    /* COMMON COLS */
    user_id                 INTEGER NOT NULL, /* ID of the instructor that chose the option */
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    /* TOKEN COLS */
    configuration_id        INTEGER NOT NULL, /* FK reference to the configuration */
    notifications_pref      BOOLEAN,

    PRIMARY KEY(option_id),

    CONSTRAINT `fk_shoutout_option_configuration`
        FOREIGN KEY (`configuration_id`)
        REFERENCES `{$SHOUTOUTS_CONFIGURATION_TABLE_NAME}` (`configuration_id`)
        ON DELETE CASCADE

) ENGINE = InnoDB DEFAULT CHARSET=utf8";

$SHOUTOUTS_TYPE_EXCLUSION = "CREATE TABLE {$SHOUTOUTS_TYPE_EXCLUSION_TABLE_NAME} (

    /* PRIMARY KEY */
    exclusion_id            INTEGER NOT NULL AUTO_INCREMENT,
    
    /* COMMON COLS */
    context_id              INTEGER, /* Tracked and scoped, this is the course */
    link_id                 INTEGER, /* Tracked but not scoped, this is the instance */
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    /* EXCLUSION COLS */
    configuration_id        INTEGER NOT NULL, /* Indication of the related configuration */
    award_type_id           INTEGER NOT NULL, /* Indication of the award to be excluded */

    PRIMARY KEY(exclusion_id)

) ENGINE = InnoDB DEFAULT CHARSET=utf8";

/** Table installation (if tables don't exist) */
$DATABASE_INSTALL = array(
    array($SHOUTOUTS_CONFIGURATION_TABLE_NAME, $SHOUTOUTS_CONFIGURATION),
    array($SHOUTOUTS_INSTANCE_TABLE_NAME, $SHOUTOUTS_INSTANCE),
    array($SHOUTOUTS_TYPE_TABLE_NAME, $SHOUTOUTS_TYPE),
    array($SHOUTOUTS_INSTRUCTOR_OPTION_TABLE_NAME, $SHOUTOUTS_INSTRUCTOR_OPTION),
    array($SHOUTOUTS_TYPE_EXCLUSION_TABLE_NAME, $SHOUTOUTS_TYPE_EXCLUSION)
);

$DATABASE_UPGRADE = function ($oldversion) {
    global $PDOX, $SHOUTOUTS_TYPE_TABLE_NAME;
    // Check if any types exist
    $sql = "SELECT EXISTS (SELECT 1 FROM {$SHOUTOUTS_TYPE_TABLE_NAME}) as data_exists";
    $q = $PDOX->rowDie($sql);
    if (!isset($q['data_exists']) || $q['data_exists'] != true) {
        // There are no award types in the db - default them
        $sql = "INSERT INTO {$SHOUTOUTS_TYPE_TABLE_NAME} 
                    (award_type_id, image_url, label, short_description)
                VALUES
                    (
                        1,
                        '/assets/Awesome_Annotator.png',
                        'Awesome Annotator',
                        'A little note here, a thought-provoking question there. Your reading notes help us all learn!'
                    ),
                    (
                        2,
                        '/assets/Cool_Collaborator.png',
                        'Cool Collaborator',
                        'You’re a helpful person who makes sure everything is getting done and people have what they need. Keep it up!'
                    ),
                    (
                        3,
                        '/assets/Legendary_Leader.png',
                        'Legendary Leader',
                        'You organize. You plan. You find success. Way to take initiative!'
                    ),
                    (
                        4,
                        '/assets/Resourceful_Reporter.png',
                        'Resourceful Reporter',
                        'No one takes notes and summarizes work like you. Your hard work is appreciated!'
                    ),
                    (
                        5,
                        '/assets/Prodigious_Presenter.png',
                        'Prodigious Presenter',
                        'Did you just present at TEDx? That’s how good your presentation was. Awesome stuff!'
                    ),
                    (
                        6,
                        '/assets/Terrific_Techy.png',
                        'Terrific Techy',
                        'Google’s got nothing on your tech skills. Where would we be without you?'
                    ),
                    (
                        7,
                        '/assets/Impressive_Includer.png',
                        'Impressive Includer',
                        'You engage everyone and make folks feel comfortable. I appreciate you!'
                    ),
                    (
                        8,
                        '/assets/Rigorous_Researcher.png',
                        'Rigorous Researcher',
                        'Finding information can be tough, but somehow you manage. Awesome!'
                    ),
                    (
                        9,
                        '/assets/Dynamic_Dialoguer.png',
                        'Dynamic Dialoguer',
                        'You keep the conversation going with your insightful comments. Can’t wait to hear more!'
                    ),
                    (
                        10,
                        '/assets/Idea_Inventor.png',
                        'Idea Inventor',
                        'It all starts with an idea, and you have ‘em. Keep your ideas coming!'
                    ),
                    (
                        11,
                        '/assets/Fabulous_Flyer.png',
                        'Fabulous Flyer',
                        'You make UD and our classroom community special. Thanks for everything!'
                    ),
                    (
                        12,
                        '/assets/Huge_High-Five.png',
                        'Huge High-Five',
                        'It’s a high-five. That’s the badge.'
                    ),
                    (
                        13,
                        '/assets/Marvelous_Marianist.png',
                        'Marvelous Marianist',
                        'Faith, Mary, Community, Mission, and Inclusivity - you model these Marianist principles to your peers. Thank you!'
                    )";
        echo ("Upgrading: " . $sql . "<br/>\n");
        error_log("Upgrading: " . $sql);
        $q = $PDOX->queryDie($sql);
    }

    return '202210131335';
};
