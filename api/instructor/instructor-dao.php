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

        $this->p = $CFG->dbprefix;
        $this->alertTable = $CFG->dbprefix . "template_alert";
        $this->commentTable = $CFG->dbprefix . "template_comment";
        $this->awardConfigurationTable = $CFG->dbprefix . "shoutouts_configuration";
        $this->awardInstanceTable = $CFG->dbprefix . "shoutouts_instance";
        $this->awardTypeTable = $CFG->dbprefix . "shoutouts_type";
        $this->awardInstructorOption = $CFG->dbprefix . "shoutouts_instructor_option";
        $this->awardTypeExclusionsTable = $CFG->dbprefix . "shoutouts_type_exclusion";
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
        $query = "SELECT *, (SELECT DISTINCT displayname FROM {$this->p}lti_user WHERE ai.recipient_id = user_id) as 'displayname'
        FROM {$this->awardInstanceTable} ai
        WHERE ai.context_id = :contextId";
        $arr = array(':contextId' => $contextId);
        return $this->PDOX->allRowsDie($query, $arr);
    }

    public function getUserAwardInfo($contextId, $userId, $recipientId)
    {
        $query = "SELECT ai.recipient_id as userId,
                    (SELECT DISTINCT displayname FROM {$this->p}lti_user WHERE ai.recipient_id = user_id) as 'displayname',
                    (SELECT COUNT(*)
                        FROM  {$this->awardInstanceTable} iai1
                        WHERE iai1.context_id = :contextId
                            AND iai1.recipient_id = :recipientId
                            AND iai1.award_status = 'ACCEPTED'
                    ) as `received_count`,
                    (SELECT COUNT(*) 
                        FROM  {$this->awardInstanceTable} iai2
                        WHERE iai2.context_id = :contextId
                            AND :userId = iai2.sender_id
                            AND iai2.award_status = 'ACCEPTED'
                    ) as `sent_count`
        FROM {$this->awardInstanceTable} ai
        WHERE ai.context_id = :contextId GROUP BY recipient_id";
        $arr = array(':contextId' => $contextId, ':userId' => $userId, ':recipientId' => $recipientId);
        return $this->PDOX->rowDie($query, $arr);
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
                            ai.recipient_id as `recipientId`,
                            (SELECT displayName from {$this->p}lti_user WHERE user_id = ai.sender_id LIMIT 1) as `senderName`,
                            (SELECT displayName from {$this->p}lti_user WHERE user_id = ai.recipient_id LIMIT 1) as `recipientName`,
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
                            ai.recipient_id as `recipientId`,
                            (SELECT displayName from {$this->p}lti_user WHERE user_id = ai.sender_id LIMIT 1) as `senderName`,
                            (SELECT displayName from {$this->p}lti_user WHERE email = ai.recipient_id LIMIT 1) as `recipientName`,
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

    public function addConfiguration(
        $userId,
        $contextId,
        $linkId,
        $anonymous_enabled,
        $comments_required,
        $leaderboard_enabled,
        $moderation_enabled,
        $recipient_view_enabled,
        $awarded_value,
        $received_value
    ) {
        $query = "INSERT INTO {$this->awardConfigurationTable} (user_id, context_id, link_id, anonymous_enabled, comments_required, leaderboard_enabled, moderation_enabled, recipient_view_enabled, awarded_value, received_value)
        VALUES (:userId, :contextId, :linkId, :anonymous_enabled, :comments_required, :leaderboard_enabled, :moderation_enabled, :recipient_view_enabled, :awarded_value, :received_value);";
        $arr = array(
            ':userId' => $userId,
            ':contextId' => $contextId,
            ':linkId' => $linkId,
            ':anonymous_enabled' => $anonymous_enabled,
            ':comments_required' => $comments_required,
            ':leaderboard_enabled' => $leaderboard_enabled,
            ':moderation_enabled' => $moderation_enabled,
            ':recipient_view_enabled' => $recipient_view_enabled,
            ':awarded_value' => $awarded_value,
            ':received_value' => $received_value,
        );
        $this->PDOX->queryDie($query, $arr);
        return $this->PDOX->lastInsertId();
    }

    public function updateConfiguration(
        $configuration_id,
        $anonymous_enabled,
        $comments_required,
        $leaderboard_enabled,
        $moderation_enabled,
        $recipient_view_enabled,
        $awarded_value,
        $received_value
    ) {
        $query = "UPDATE {$this->awardConfigurationTable}
        SET 
            anonymous_enabled = :anonymous_enabled, 
            comments_required = :comments_required,
            leaderboard_enabled = :leaderboard_enabled, 
            moderation_enabled = :moderation_enabled, 
            recipient_view_enabled = :recipient_view_enabled, 
            awarded_value = :awarded_value, 
            received_value = :received_value
        WHERE configuration_id = :configuration_id;";
        $arr = array(
            ':configuration_id' => $configuration_id,
            ':anonymous_enabled' => $anonymous_enabled,
            ':comments_required' => $comments_required,
            ':leaderboard_enabled' => $leaderboard_enabled,
            ':moderation_enabled' => $moderation_enabled,
            ':recipient_view_enabled' => $recipient_view_enabled,
            ':awarded_value' => $awarded_value,
            ':received_value' => $received_value,
        );
        return $this->PDOX->queryDie($query, $arr);
    }

    public function addNotificationOption($userId, $configurationId, $notificationsPref)
    {
        $query = "INSERT INTO {$this->awardInstructorOption} (user_id, configuration_id, notifications_pref)
        VALUES (:userId, :configurationId, :notificationsPref);";
        $arr = array(':userId' => $userId, ':configurationId' => $configurationId, ':notificationsPref' => (int)$notificationsPref);
        $this->PDOX->queryDie($query, $arr);
        return $this->PDOX->lastInsertId();
    }

    public function updateNotificationOption($userId, $configurationId, $notificationsPref)
    {
        $query = "UPDATE {$this->awardInstructorOption}
        SET notifications_pref = :notificationsPref
        WHERE user_id = :userId AND configuration_id = :configurationId";
        $arr = array('userId' => $userId, ':configurationId' => $configurationId, ':notificationsPref' => (int)$notificationsPref);
        return $this->PDOX->queryDie($query, $arr);
    }

    public function getNotificationOption($userId, $configurationId)
    {
        $query = "SELECT * FROM {$this->awardInstructorOption}
        WHERE user_id = :userId AND configuration_id = :configurationId";
        $arr = array('userId' => $userId, ':configurationId' => $configurationId);
        return $this->PDOX->rowDie($query, $arr);
    }

    public function addTypeExclusion($contextId, $linkId, $configurationId, $typeId)
    {
        $query = "INSERT INTO {$this->awardTypeExclusionsTable} (context_id, link_id, configuration_id, award_type_id)
        VALUES (:contextId, :linkId, :configurationId, :typeId);";
        $arr = array(':contextId' => $contextId, ':linkId' => $linkId, ':configurationId' => $configurationId, ':typeId' => $typeId);
        $this->PDOX->queryDie($query, $arr);
        return $this->PDOX->lastInsertId();
    }

    public function deleteTypeExclusions($configurationId)
    {
        $query = "DELETE FROM {$this->awardTypeExclusionsTable}
        WHERE configuration_id = :configurationId";
        $arr = array(':configurationId' => $configurationId);
        return $this->PDOX->queryDie($query, $arr);
    }

    /** Retrieves a list of all awards for the given context (course) */
    public function getAllAwardTypes($contextId)
    {
        // These are being aliased to camelCase - may or may not be really necessary
        $query = "SELECT    t.award_type_id as `id`,
                            t.image_url as `imageUrl`,
                            t.label as `label`,
                            t.short_description as `description`
        FROM {$this->awardTypeTable} t
        LEFT OUTER JOIN {$this->awardTypeExclusionsTable} e
        ON t.award_type_id = e.award_type_id
        WHERE (t.context_id = :contextId OR t.context_id IS NULL)
        ORDER BY t.label ASC;";
        $arr = array(':contextId' => $contextId);
        return $this->PDOX->allRowsDie($query, $arr);
    }
}
