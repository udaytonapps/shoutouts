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
            $leader['awards'] = self::$learnerDAO->getReceivedApprovedCourseAwards($leader['userId'], self::$contextId);
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
            $subject = "Award request $action for " . $CONTEXT->title;
            $type = self::$learnerDAO->getAwardType($updatedAward['award_type_id']);
            $recipient = self::$commonDAO->getUserContact($updatedAward['recipient_id']);
            $reasonString = isset($updatedAward['moderation_comment']) ? "Instructor Comment: {$updatedAward['moderation_comment']}\n\n" : "";
            $instructorMsg = "Your request has been {$action}.\n\n{$reasonString}Course: {$CONTEXT->title}\nRecipient: {$recipient['displayname']}\nAward Type: {$type['label']}\nSender Comment: {$updatedAward['sender_comment']}";
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
        $subject = "You received an award in " . $CONTEXT->title;
        $type = self::$learnerDAO->getAwardType($typeId);
        $recipient = self::$commonDAO->getUserContact($recipientId);
        $instructorMsg = "Congrats! You received an award.\n\nCourse: {$CONTEXT->title}\nAward Type: {$type['label']}";
        CommonService::sendEmailFromActiveUser($recipient['displayname'], $recipient['email'], $subject, $instructorMsg);
    }
}
InstructorCtr::init();
