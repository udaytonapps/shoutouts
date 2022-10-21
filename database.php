<?php

// The SQL to uninstall this tool
$DATABASE_UNINSTALL = array();

/** Table names */
$AWARDS_CONFIGURATION_TABLE_NAME = "{$CFG->dbprefix}awards_configuration";
$AWARDS_INSTANCE_TABLE_NAME = "{$CFG->dbprefix}awards_instance";
$AWARDS_TYPE_TABLE_NAME = "{$CFG->dbprefix}awards_type";
$AWARDS_TYPE_EXCLUSION_TABLE_NAME = "{$CFG->dbprefix}awards_type_exclusion";

/** Table schemas */

$AWARDS_CONFIGURATION = "CREATE TABLE {$AWARDS_CONFIGURATION_TABLE_NAME} (

    /* PRIMARY KEY */
    configuration_id        INTEGER NOT NULL AUTO_INCREMENT,
    
    /* COMMON COLS */
    context_id              INTEGER, /* Tracked and scoped, this is the course */
    link_id                 INTEGER, /* Tracked but not scoped, this is the instance */
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    /* CONFIGURATION COLS */
    comments_required       BOOLEAN NOT NULL,
    moderation_enabled      BOOLEAN NOT NULL,
    anonymous_enabled       BOOLEAN NOT NULL,
    recipient_view_enabled  BOOLEAN NOT NULL,
    notifications_enabled   BOOLEAN NOT NULL,
    leaderboard_enabled     BOOLEAN NOT NULL,
    awarded_value           INTEGER, -- NULLABLE?
    awarded_limit           INTEGER, -- NULLABLE?
    awarded_cooldown        INTEGER, -- NULLABLE?
    received_value          INTEGER, -- NULLABLE?
    received_limit          INTEGER, -- NULLABLE?
    received_cooldown       INTEGER, -- NULLABLE?


    PRIMARY KEY(configuration_id)

) ENGINE = InnoDB DEFAULT CHARSET=utf8";

$AWARDS_INSTANCE = "CREATE TABLE {$AWARDS_INSTANCE_TABLE_NAME} (

    /* PRIMARY KEY */
    award_instance_id       INTEGER NOT NULL AUTO_INCREMENT,
    
    /* COMMON COLS */
    context_id              INTEGER NOT NULL, /* Tracked and scoped, this is the course */
    link_id                 INTEGER NOT NULL, /* Tracked but not scoped, this is the instance */
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    /* TEMPLATE COMMENT COLS */
    sender_id               INTEGER NOT NULL, /* ID of the learner who sent it */
    recipient_id            INTEGER NOT NULL, /* ID of the learner who received it */
    award_type_id           INTEGER NOT NULL, /* ID of the associated award type */
    award_status            TEXT NOT NULL,
    comment_message         TEXT,

    PRIMARY KEY(award_instance_id)

) ENGINE = InnoDB DEFAULT CHARSET=utf8";

$AWARDS_TYPE = "CREATE TABLE {$AWARDS_TYPE_TABLE_NAME} (

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

$AWARDS_TYPE_EXCLUSION = "CREATE TABLE {$AWARDS_TYPE_EXCLUSION_TABLE_NAME} (

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
    array($AWARDS_CONFIGURATION_TABLE_NAME, $AWARDS_CONFIGURATION),
    array($AWARDS_INSTANCE_TABLE_NAME, $AWARDS_INSTANCE),
    array($AWARDS_TYPE_TABLE_NAME, $AWARDS_TYPE),
    array($AWARDS_TYPE_EXCLUSION_TABLE_NAME, $AWARDS_TYPE_EXCLUSION)
);

$DATABASE_UPGRADE = function ($oldversion) {
    global $PDOX, $AWARDS_TYPE_TABLE_NAME;
    // Check if any types exist
    $sql = "SELECT EXISTS (SELECT 1 FROM {$AWARDS_TYPE_TABLE_NAME}) as data_exists";
    $q = $PDOX->rowDie($sql);
    if (!isset($q['data_exists']) || $q['data_exists'] != true) {
        // There are no award types in the db - default them
        $sql = "INSERT INTO {$AWARDS_TYPE_TABLE_NAME} 
                    (image_url, label, short_description)
                VALUES
                    ('/assets/cool_collaborator.png', 'Cool Collaborator', 'You’re a helpful person who makes sure everything is getting done and people have what they need. Keep it up!'),
                    ('/assets/legendary_leader.png', 'Legendary Leader', 'You organize. You plan. You find success. Way to take initiative!'),
                    ('/assets/resourceful_reporter.png', 'Resourceful Reporter', 'No one takes notes and summarizes work like you. Your hard work is appreciated!'),
                    ('/assets/placeholder.png', 'Prodigious Presenter', 'Did you just present at TEDx? That’s how good your presentation was. Awesome stuff!'),
                    ('/assets/placeholder.png', 'Terrific Techy', 'Google’s got nothing on your tech skills. Where would we be without you?'),
                    ('/assets/placeholder.png', 'Impressive Includer', 'You engage everyone and make folks feel comfortable. I appreciate you!'),
                    ('/assets/placeholder.png', 'Rigorous Researcher', 'Finding information can be tough, but somehow you manage. Awesome!'),
                    ('/assets/placeholder.png', 'Dynamic Dialoguer', 'You keep the conversation going with your insightful comments. Can’t wait to hear more!'),
                    ('/assets/placeholder.png', 'Idea Inventor', 'It all starts with an idea, and you have ‘em. Keep your ideas coming!'),
                    ('/assets/placeholder.png', 'Fabulous Flyer', 'You make UD and our classroom community special. Thanks for everything!'),
                    ('/assets/placeholder.png', 'Huge High-Five', 'It’s a high-five. That’s the badge.'),
                    ('/assets/placeholder.png', 'Marvelous Marianist', 'Faith, Mary, Community, Mission, and Inclusivity - you model these Marianist principles to your peers. Thank you!')";
        echo ("Upgrading: " . $sql . "<br/>\n");
        error_log("Upgrading: " . $sql);
        $q = $PDOX->queryDie($sql);
    }

    return '202210131335';
};
