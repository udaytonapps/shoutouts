<?php

/** DAO class methods/properties are not static as prefix string cannot be easily embedded */

/** Holds methods for retrieving data from the db */
class InstructorDAO
{
    protected $p;
    protected $alertTable;
    protected $commentTable;
    protected $PDOX;

    public function __construct()
    {
        global $CFG, $PDOX;

        $this->alertTable = $CFG->dbprefix . "template_alert";
        $this->commentTable = $CFG->dbprefix . "template_comment";
        $this->awardConfigurationTable = $CFG->dbprefix . "awards_configuration";
        $this->awardInstanceTable = $CFG->dbprefix . "awards_instance";
        $this->awardTypeTable = $CFG->dbprefix . "awards_type";
        $this->awardTypeExclusionsTable = $CFG->dbprefix . "awards_type_exclusion";
        $this->PDOX = $PDOX;
    }

    /** Adds an alert with multiple identifying IDs */
    public function addAlert($userId, $contextId, $linkId, $alertMessage, $alertType)
    {
        $query = "INSERT INTO {$this->alertTable} (user_id, context_id, link_id, alert_message, alert_type)
        VALUES (:userId, :contextId, :linkId, :alertMessage, :alertType);";
        $arr = array(':userId' => $userId, ':contextId' => $contextId, ':linkId' => $linkId, ':alertMessage' => $alertMessage, ':alertType' => $alertType);
        $this->PDOX->queryDie($query, $arr);
        return $this->PDOX->lastInsertId();
    }

    /** Deletes an alert by ID */
    public function deleteAlert($alertId)
    {
        $query = "DELETE FROM {$this->alertTable}
        WHERE alert_id = :alertId";
        $arr = array(':alertId' => $alertId);
        return $this->PDOX->queryDie($query, $arr);
    }

    /** Retrieves the leaderboard for the given context */
    public function getAllAwards($contextId)
    {
        // These are being aliased to camelCase - may or may not be really necessary
        $query = "SELECT DISTINCT   u.user_id as `userId`,
                                    u.displayname as `displayname`,
                                    u.email as `email`,
                                    (SELECT COUNT(*) 
                                        FROM  {$this->awardInstanceTable} iai
                                        WHERE iai.context_id = :contextId
                                            AND u.email = iai.recipient_id
                                            AND iai.award_status = 'ACCEPTED'
                                    ) as `count`
        FROM {$this->p}lti_user u
        INNER JOIN {$this->awardInstanceTable} ai
            ON ai.recipient_id = u.email
        WHERE ai.context_id = :contextId AND ai.award_status = 'ACCEPTED' ORDER BY `count` DESC";
        $arr = array(':contextId' => $contextId);
        return $this->PDOX->allRowsDie($query, $arr);
    }

    /** Retrieves awards history for a given context (course) */
    public function getAwardsHistory($contextId)
    {
        // These are being aliased to camelCase - may or may not be really necessary
        $query = "SELECT    ai.award_instance_id as `id`,
                            ai.sender_comment as `comment`,
                            ai.moderation_comment as `instructorComment`,
                            ai.created_at as `createdAt`,
                            ai.updated_at as `updatedAt`,
                            ai.award_status as `status`,
                            (SELECT displayName from {$this->p}lti_user WHERE user_id = ai.sender_id) as `senderName`,
                            (SELECT displayName from {$this->p}lti_user WHERE email = ai.recipient_id) as `recipientName`,
                            atype.image_url as imageUrl,
                            atype.label as label,
                            atype.short_description as 'description'
                FROM {$this->awardInstanceTable} ai
        INNER JOIN {$this->awardTypeTable} atype
            ON atype.award_type_id = ai.award_type_id
        WHERE ai.context_id = :contextId ORDER BY ai.created_at DESC;";
        $arr = array(':contextId' => $contextId);
        return $this->PDOX->allRowsDie($query, $arr);
    }

    /** Retrieves a list of awards that are pending review/moderation */
    public function getPendingAwards($contextId)
    {
        // These are being aliased to camelCase - may or may not be really necessary
        $query = "SELECT    ai.award_instance_id as `id`,
                            ai.sender_comment as `comment`,
                            ai.created_at as `createdAt`,
                            ai.updated_at as `updatedAt`,
                            ai.award_status as `status`,
                            (SELECT displayName from {$this->p}lti_user WHERE user_id = ai.sender_id) as `senderName`,
                            (SELECT displayName from {$this->p}lti_user WHERE email = ai.recipient_id) as `recipientName`,
                            atype.image_url as imageUrl,
                            atype.label as label,
                            atype.short_description as 'description'
                FROM {$this->awardInstanceTable} ai
        INNER JOIN {$this->awardTypeTable} atype
            ON atype.award_type_id = ai.award_type_id
        WHERE ai.award_status = 'SUBMITTED' AND ai.context_id = :contextId ORDER BY ai.created_at DESC;";
        $arr = array(':contextId' => $contextId);
        return $this->PDOX->allRowsDie($query, $arr);
    }

    public function updateAward($contextId, $awardId, $newStatus, $instructorId, $instructorComment)
    {
        $commentAssignment = isset($instructorComment) ? "ai.moderation_comment = :instructorComment," : "";
        $query = "UPDATE {$this->awardInstanceTable} ai
        SET ai.award_status = :newStatus, ai.instructor_id = :instructorId, {$commentAssignment} status_updated_at = CURRENT_TIMESTAMP
        WHERE ai.award_instance_id = :awardId AND ai.context_id = :contextId";
        $arr = array(':contextId' => $contextId, ':awardId' => $awardId, ':newStatus' => $newStatus, ':instructorId' => $instructorId);
        if (isset($instructorComment)) {
            $arr[':instructorComment'] = $instructorComment;
        }
        return $this->PDOX->queryDie($query, $arr);
    }

    public function getAward($awardId)
    {
        $query = "SELECT * FROM {$this->awardInstanceTable}
        WHERE award_instance_id = :awardId";
        $arr = array(':awardId' => $awardId);
        return $this->PDOX->rowDie($query, $arr);
    }
}
