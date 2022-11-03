<?php

/** Holds methods for handling each route. Constructed with the request path (uri) */
class InstructorCtr
{
    /** @var InstructorDAO */
    protected static $DAO;
    /** @var LearnerDAO */
    protected static $learnerDAO;
    /** @var CommonDAO */
    protected static $commonDAO;
    protected static $LTIX;
    protected static $user;
    protected static $contextId;
    protected static $linkId;

    public static function init()
    {
        global $USER, $CONTEXT, $LINK;
        self::$DAO = new InstructorDAO();
        self::$learnerDAO = new LearnerDAO();
        self::$commonDAO = new CommonDAO();
        self::$user = $USER;
        self::$contextId = $CONTEXT->id;
        self::$linkId = $LINK->id;
    }

    /** Template function to add an alert for the banner */
    static function addAlert($data)
    {
        $message = $data['message'];
        // Default type to 'info' if not specified (in this demo it is optional in the route function)
        $type = $data['type'] ? $data['type'] : 'info';
        return self::$DAO->addAlert(self::$user->id, self::$contextId, self::$linkId, $message, $type);
    }

    /** Template function to update an alert for the banner */
    static function getCourseAlerts()
    {
        // Instructor can call learner DAO, but not the other way around
        return self::$learnerDAO->getCourseAlerts(self::$contextId);
    }

    /** Template function to delete an alert for the banner */
    static function deleteAlert($alertId)
    {
        // Don't need to return the result of a delete operation
        self::$DAO->deleteAlert($alertId);
    }

    /** Get enabled award types */
    static function getAllAwards()
    {
        $leaders = self::$DAO->getAllAwards(self::$contextId);
        // Then loop over leaders and get their awards
        foreach ($leaders as &$leader) {
            $names = explode(" ", $leader['displayname']);
            if (count($names) > 1) {
                $leader['familyName'] = array_pop($names);
                $leader['givenName'] = implode(" ", $names);
                $leader['lastFirst'] = $leader['familyName'] . ', ' . $leader['givenName'];
            } else {
                $leader['familyName'] = $leader['displayname'];
                $leader['givenName'] = "";
            }
            $leader['awards'] = self::$learnerDAO->getReceivedApprovedCourseAwards($leader['email'], self::$contextId);
        }
        return $leaders;
    }

    /** Get enabled award types */
    static function getAwardsHistory()
    {
        $awards = self::$DAO->getAwardsHistory(self::$contextId);
        foreach ($awards as &$award) {
            // Sender
            $names = explode(" ", $award['senderName']);
            if (count($names) > 1) {
                $award['senderName'] = $names[1] . ', ' . $names[0];
            } else {
                $award['senderName'] = $award[0];
            }
            // Recipient
            $names = explode(" ", $award['recipientName']);
            if (count($names) > 1) {
                $award['recipientName'] = $names[1] . ', ' . $names[0];
            } else {
                $award['recipientName'] = $award[0];
            }
        }
        return $awards;
    }

    /** Get pending awards */
    static function getPendingAwards()
    {
        return self::$DAO->getPendingAwards(self::$contextId);
    }

    static function updateAward($data)
    {
        global $CONTEXT;
        // Comment is optional (it is not currently included when request is ACCEPTED)
        $comment = isset($data['instructorComment']) ? $data['instructorComment'] : null;
        $res = self::$DAO->updateAward(self::$contextId, $data['id'], $data['status'], self::$user->id, $comment);
        if ($res->rowCount() !== 0) {
            // Row was updated, send confirmation email to learner
            $updatedAward = self::$DAO->getAward($data['id']);
            $learner = self::$commonDAO->getUserContact($updatedAward['sender_id']);
            $action = strtolower($updatedAward['award_status']);
            $subject = "Shoutout request $action for " . $CONTEXT->title;
            $type = self::$learnerDAO->getAwardType($updatedAward['award_type_id']);
            // $recipient = self::$commonDAO->getUserContact($updatedAward['recipient_id']);
            $reasonString = isset($updatedAward['moderation_comment']) ? "Instructor Comment: {$updatedAward['moderation_comment']}\n\n" : "";
            $instructorMsg = "The Shoutout you sent has been {$action}.\n\n{$reasonString}Course: {$CONTEXT->title}\nRecipient: {$updatedAward['recipient_id']}\nAward Type: {$type['label']}\nSender Comment: {$updatedAward['sender_comment']}";
            CommonService::sendEmailFromActiveUser($learner['displayname'], $learner['email'], $subject, $instructorMsg);
            if ($data['status'] == 'ACCEPTED') {
                self::sendApprovalEmailToRecipient($updatedAward['recipient_id'], $updatedAward['award_type_id']);
            }
            return $res->rowCount();
        } else {
            // Row was not updated
            http_response_code(500);
            $res = array("error" => "Unable to update request");
            return $res;
        }
    }

    static function sendApprovalEmailToRecipient($recipientId, $typeId)
    {
        global $CONTEXT;
        $subject = "You received a Shoutout in " . $CONTEXT->title;
        $type = self::$learnerDAO->getAwardType($typeId);
        // $recipient = self::$commonDAO->getUserContact($recipientId);
        $instructorMsg = "Congrats! You received a Shoutout!\n\nCourse: {$CONTEXT->title}\nAward Type: {$type['label']}";
        CommonService::sendEmailFromActiveUser(null, $recipientId, $subject, $instructorMsg);
    }

    /** Creates a new configuration (along with associated categories) */
    static function addConfiguration($data)
    {
        $config = $data['configuration'];
        $exclusionIds = $data['exclusionIds'];

        $newConfigId = self::$DAO->addConfiguration(
            self::$user->id,
            self::$contextId,
            self::$linkId,
            (int)$config['anonymous_enabled'],
            (int)$config['comments_required'],
            (int)$config['leaderboard_enabled'],
            (int)$config['moderation_enabled'],
            (int)$config['recipient_view_enabled'],
            (int)$config['awarded_value'],
            (int)$config['received_value']
        );
        if (isset($newConfigId)) {
            // add the notification option pref for the current instructor
            self::$DAO->addNotificationOption(self::$user->id, $newConfigId, $config['notifications_enabled']);
            // assign type exclusions related to the configuration
            foreach ($exclusionIds as $typeId) {
                self::$DAO->addTypeExclusion(
                    self::$contextId,
                    self::$linkId,
                    $newConfigId,
                    $typeId
                );
            }
        }
        return $newConfigId;
    }

    /** Returns the instructor's configuration for the current context */
    static function getConfiguration()
    {
        $config = self::$learnerDAO->getContextConfiguration(self::$contextId);
        if (isset($config['configuration_id'])) {
            $option = true;
            $existingOptions = self::$DAO->getNotificationOption(self::$user->id, $config['configuration_id']);
            if (isset($existingOptions['option_id'])) {
                $option = (bool)$existingOptions['notifications_pref'];
            }
            $config['anonymous_enabled'] = $config['anonymous_enabled'] ? true : false;
            $config['comments_required'] = $config['comments_required'] ? true : false;
            $config['leaderboard_enabled'] = $config['leaderboard_enabled'] ? true : false;
            $config['moderation_enabled'] = $config['moderation_enabled'] ? true : false;
            $config['recipient_view_enabled'] = $config['recipient_view_enabled'] ? true : false;
            $config['notifications_enabled'] = $option;
            // Optional
            $config['awarded_value'] = $config['awarded_value'] ? (int)$config['awarded_value'] : 0;
            $config['received_value'] = $config['received_value'] ? (int)$config['received_value'] : 0;
            // awarded_cooldown null
            // awarded_limit null
            // received_cooldown null
            // received_limit null
            return $config;
        } else {
            return null;
        }
    }

    /** Update the configuration and its associated categories */
    static function updateConfiguration($data)
    {
        $config = $data['configuration'];
        $exclusionIds = $data['exclusionIds'];

        // Update the configuration
        self::$DAO->updateConfiguration(
            $config['configuration_id'],
            (int)$config['anonymous_enabled'],
            (int)$config['comments_required'],
            (int)$config['leaderboard_enabled'],
            (int)$config['moderation_enabled'],
            (int)$config['recipient_view_enabled'],
            (int)$config['awarded_value'],
            (int)$config['received_value']
        );

        // For each update, no need to track toggling, just clear all exclusions and re-add
        self::$DAO->deleteTypeExclusions($config['configuration_id']);
        // assign type exclusions related to the configuration
        foreach ($exclusionIds as $typeId) {
            self::$DAO->addTypeExclusion(
                self::$contextId,
                self::$linkId,
                $config['configuration_id'],
                $typeId
            );
        }

        $notificationsPref = $config['notifications_enabled'];
        $existingOptions = self::$DAO->getNotificationOption(self::$user->id, $config['configuration_id']);
        if (isset($existingOptions['option_id'])) {
            self::$DAO->updateNotificationOption(self::$user->id, $config['configuration_id'], $notificationsPref);
        } else {
            self::$DAO->addNotificationOption(self::$user->id, $config['configuration_id'], $notificationsPref);
        }
    }

    /** Get enabled award types */
    static function getAllAwardTypes()
    {
        return self::$DAO->getAllAwardTypes(self::$contextId);
    }
}
InstructorCtr::init();
