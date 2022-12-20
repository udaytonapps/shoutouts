<?php

/** DAO class methods/properties are not static as prefix string cannot be easily embedded */

/** Holds methods for retrieving data from the db */
class LearnerDAO
{
    protected $p;
    protected $alertTable;
    protected $commentTable;
    protected $PDOX;

    public function __construct()
    {
        global $CFG, $PDOX;

        $this->p = $CFG->dbprefix;
        $this->alertTable = $CFG->dbprefix . "template_alert";
        $this->commentTable = $CFG->dbprefix . "template_comment";
        $this->awardConfigurationTable = $CFG->dbprefix . "shoutouts_configuration";
        $this->awardInstanceTable = $CFG->dbprefix . "shoutouts_instance";
        $this->awardTypeTable = $CFG->dbprefix . "shoutouts_type";
        $this->awardTypeExclusionsTable = $CFG->dbprefix . "shoutouts_type_exclusion";
        $this->awardInstructorOption = $CFG->dbprefix . "shoutouts_instructor_option";
        $this->PDOX = $PDOX;
    }

    /** Retrieves alerts for a given context (course) */
    public function getCourseAlerts($contextId)
    {
        // These are being aliased to camelCase - may or may not be really necessary
        $query = "SELECT alert_id as `id`, alert_message as `message`, alert_type as `type` FROM {$this->alertTable}
        WHERE context_id = :contextId ORDER BY created_at DESC;";
        $arr = array(':contextId' => $contextId);
        return $this->PDOX->allRowsDie($query, $arr);
    }

    /** Adds a comment with multiple identifying IDs */
    public function addComment($userId, $contextId, $linkId, $commentText)
    {
        $query = "INSERT INTO {$this->commentTable} (user_id, context_id, link_id, sender_comment)
        VALUES (:userId, :contextId, :linkId, :commentText);";
        $arr = array(':userId' => $userId, ':contextId' => $contextId, ':linkId' => $linkId, ':commentText' => $commentText);
        $this->PDOX->queryDie($query, $arr);
        return $this->PDOX->lastInsertId();
    }

    /** Retrieves alerts for a given context (course) */
    public function getCourseComments($contextId)
    {
        // These are being aliased to camelCase - may or may not be really necessary
        $query = "SELECT c.comment_id as `id`, c.sender_comment as `text`, c.created_at as `createdAt`, u.displayname as learnerName FROM {$this->commentTable} c
        INNER JOIN {$this->p}lti_user u
            ON u.user_id = c.user_id
        WHERE c.context_id = :contextId ORDER BY c.created_at DESC;";
        $arr = array(':contextId' => $contextId);
        return $this->PDOX->allRowsDie($query, $arr);
    }

    // AWARDS

    public function getContextConfiguration($contextId)
    {
        $query = "SELECT * FROM {$this->awardConfigurationTable}
        WHERE context_id = :contextId;";
        $arr = array(':contextId' => $contextId);
        return $this->PDOX->rowDie($query, $arr);
    }

    /** Adds an award instance */
    public function addAward($contextId, $linkId, $senderId, $recipientId, $awardTypeId, $commentText, $awardStatus)
    {
        $query = "INSERT INTO {$this->awardInstanceTable} (context_id, link_id, sender_id, recipient_id, award_type_id, sender_comment, award_status)
        VALUES (:contextId, :linkId, :senderId, :recipientId, :awardTypeId, :commentText, :awardStatus);";
        $arr = array(
            ':contextId' => $contextId,
            ':linkId' => $linkId,
            ':senderId' => $senderId,
            ':recipientId' => $recipientId,
            ':awardTypeId' => $awardTypeId,
            ':commentText' => $commentText,
            ':awardStatus' => $awardStatus,
        );
        $this->PDOX->queryDie($query, $arr);
        return $this->PDOX->lastInsertId();
    }

    public function getAwardType($typeId)
    {
        $query = "SELECT * FROM {$this->awardTypeTable}
        WHERE award_type_id = :typeId";
        $arr = array(':typeId' => $typeId);
        return $this->PDOX->rowDie($query, $arr);
    }

    /** Retrieves a list of awards that are enabled for the given context (course) */
    public function getEnabledAwardTypes($contextId)
    {
        // These are being aliased to camelCase - may or may not be really necessary
        $query = "SELECT    t.award_type_id as `id`,
                            t.image_url as `imageUrl`,
                            t.label as `label`,
                            t.short_description as `description`
        FROM {$this->awardTypeTable} t
        WHERE t.award_type_id NOT IN (
            SELECT e.award_type_id FROM {$this->awardTypeExclusionsTable} e
            WHERE e.context_id = :contextId
        )
        AND (t.context_id = :contextId OR t.context_id IS NULL)
        AND t.is_active = 1
        ORDER BY t.label ASC;";
        $arr = array(':contextId' => $contextId);
        return $this->PDOX->allRowsDie($query, $arr);
    }

    /** Retrieves awards for a given context (course) */
    public function getReceivedApprovedCourseAwards($recipientId, $contextId)
    {
        // These are being aliased to camelCase - may or may not be really necessary
        $query = "SELECT    ai.award_instance_id as `id`,
                            ai.sender_comment as `comment`,
                            ai.created_at as `createdAt`,
                            atype.image_url as imageUrl,
                            atype.label as label,
                            atype.short_description as 'description',
                            (SELECT displayname FROM {$this->p}lti_user WHERE user_id = ai.sender_id LIMIT 1) as `senderName`
                FROM {$this->awardInstanceTable} ai
        INNER JOIN {$this->awardTypeTable} atype
            ON atype.award_type_id = ai.award_type_id
        WHERE ai.recipient_id = :recipientId AND ai.context_id = :contextId AND ai.award_status = 'ACCEPTED' ORDER BY ai.created_at DESC;";
        $arr = array(':recipientId' => $recipientId, ':contextId' => $contextId);
        return $this->PDOX->allRowsDie($query, $arr);
    }

    /** Retrieves sent awards for a given context (course) */
    public function getSentCourseAwards($userId, $contextId)
    {
        // These are being aliased to camelCase - may or may not be really necessary
        $query = "SELECT    ai.award_instance_id as `id`,
                            ai.sender_comment as `comment`,
                            ai.moderation_comment as `instructorComment`,
                            ai.created_at as `createdAt`,
                            ai.updated_at as `updatedAt`,
                            ai.award_status as `status`,
                            ai.recipient_id as `recipientId`,
                            (SELECT displayname FROM {$this->p}lti_user WHERE user_id = ai.sender_id LIMIT 1) as `senderName`,
                            (SELECT displayname FROM {$this->p}lti_user WHERE user_id = ai.recipient_id LIMIT 1) as `recipientName`,
                            atype.image_url as imageUrl,
                            atype.label as label,
                            atype.short_description as 'description'
                FROM {$this->awardInstanceTable} ai
        INNER JOIN {$this->awardTypeTable} atype
            ON atype.award_type_id = ai.award_type_id
        WHERE ai.sender_id = :userId AND ai.context_id = :contextId ORDER BY ai.created_at DESC;";
        $arr = array(':userId' => $userId, ':contextId' => $contextId);
        return $this->PDOX->allRowsDie($query, $arr);
    }

    /** Retrieves the leaderboard for the given context */
    public function getLeaderboardLeaders($contextId, $limit)
    {
        // These are being aliased to camelCase - may or may not be really necessary
        $query = "SELECT DISTINCT   (SELECT displayname FROM {$this->p}lti_user WHERE ai.recipient_id = user_key LIMIT 1) as displayname,
                                    (SELECT COUNT(*)
                                        FROM  {$this->awardInstanceTable} iai1
                                        WHERE iai1.context_id = :contextId
                                            AND iai1.recipient_id = ai.recipient_id
                                            AND iai1.award_status = 'ACCEPTED'
                                    ) as `receivedCount`,
                                    recipient_id
        FROM {$this->awardInstanceTable} ai
        WHERE ai.context_id = :contextId AND ai.award_status = 'ACCEPTED' ORDER BY `receivedCount` DESC LIMIT {$limit}";
        $arr = array(':contextId' => $contextId);
        return $this->PDOX->allRowsDie($query, $arr);
    }

    public function getInstructorNotificationOption($instructorId, $configurationId)
    {
        $query = "SELECT * FROM {$this->awardInstructorOption}
        WHERE user_id = :userId AND configuration_id = :configurationId";
        $arr = array('userId' => $instructorId, ':configurationId' => $configurationId);
        return $this->PDOX->rowDie($query, $arr);
    }
}
