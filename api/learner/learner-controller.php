<?php

/** Holds methods for handling each route. Constructed with the request path (uri) */
class LearnerCtr
{
    /** @var LearnerDAO */
    protected static $DAO;
    /** @var CommonDAO */
    protected static $commonDAO;
    protected static $LTIX;
    protected static $user;
    protected static $contextId;
    protected static $linkId;

    public static function init()
    {
        global $USER, $CONTEXT, $LINK;
        self::$DAO = new LearnerDAO();
        self::$commonDAO = new CommonDAO();
        self::$user = $USER;
        self::$contextId = $CONTEXT->id;
        self::$linkId = $LINK->id;
    }

    /** Template function to update an alert for the banner */
    static function getCourseAlerts()
    {
        // Instructor can call learner DAO, but not the other way around
        return self::$DAO->getCourseAlerts(self::$contextId);
    }

    /** Template function to add an alert for the banner */
    static function addComment($data)
    {
        return self::$DAO->addComment(self::$user->id, self::$contextId, self::$linkId, $data['text']);
    }

    /** Template function to update an alert for the banner */
    static function getCourseComments()
    {
        // Instructor can call learner DAO, but not the other way around
        return self::$DAO->getCourseComments(self::$contextId);
    }

    // AWARDS

    static function getContextConfiguration()
    {
        $config = self::$DAO->getContextConfiguration(self::$contextId);
        if (isset($config) && isset($config['configuration_id'])) {
            // Required
            $config['anonymous_enabled'] = $config['anonymous_enabled'] ? true : false;
            $config['comments_required'] = $config['comments_required'] ? true : false;
            $config['leaderboard_enabled'] = $config['leaderboard_enabled'] ? true : false;
            $config['moderation_enabled'] = $config['moderation_enabled'] ? true : false;
            $config['notifications_enabled'] = $config['notifications_enabled'] ? true : false;
            $config['recipient_view_enabled'] = $config['recipient_view_enabled'] ? true : false;
            // Optional
            // awarded_cooldown null
            // awarded_limit null
            // awarded_value "1"
            // received_cooldown null
            // received_limit null
            // received_value "2"
        }
        return $config;
    }

    /** Add an award for a learner */
    static function addAward($data)
    {
        // Check config to see if moderation is required. If so, auto-moderation should be false
        $config = self::$DAO->getContextConfiguration(self::$contextId);
        if ($config['moderation_enabled'] == 1) {
            $awardStatus = "SUBMITTED";
        } else {
            $awardStatus = "ACCEPTED";
        }
        $res = self::$DAO->addAward(self::$contextId, self::$linkId, self::$user->id, $data['recipientId'], $data['awardTypeId'], $data['comment'], $awardStatus);
        if ($awardStatus == 'ACCEPTED') {
            self::sendApprovalEmailToRecipient($data['recipientId'], $data['awardTypeId']);
        }
        return $res;
    }

    static function sendApprovalEmailToRecipient($recipientId, $typeId)
    {
        global $CONTEXT;
        $subject = "You received an award in " . $CONTEXT->title;
        $type = self::$DAO->getAwardType($typeId);
        $recipient = self::$commonDAO->getUserContact($recipientId);
        $instructorMsg = "Congrats! You received an award.\n\nCourse: {$CONTEXT->title}\nAward Type: {$type['label']}";
        CommonService::sendEmailFromActiveUser($recipient['displayname'], $recipient['email'], $subject, $instructorMsg);
    }

    /** Get received awards */
    static function getReceivedApprovedCourseAwards()
    {
        $config = self::getContextConfiguration();
        $res = self::$DAO->getReceivedApprovedCourseAwards(self::$user->id, self::$contextId);
        if ($config['anonymous_enabled']) {
            foreach ($res as &$award) {
                $award['senderName'] = null;
                $award['comment'] = null;
            }
        }
        return $res;
    }

    /** Get sent awards */
    static function getSentCourseAwards()
    {
        $sentAwards = self::$DAO->getSentCourseAwards(self::$user->id, self::$contextId);
        foreach ($sentAwards as &$award) {
            if (isset($award['approved']) && $award['approved'] == 0) {
                $award['approved'] = false;
            } else {
                $award['approved'] = true;
            }
            $names = explode(" ", $award['senderName']);
            if (count($names) > 1) {
                $familyName = array_pop($names);
                $givenName = implode(" ", $names);
                $award['senderName'] = $familyName . ', ' . $givenName;
            }
            $names = explode(" ", $award['recipientName']);
            if (count($names) > 1) {
                $familyName = array_pop($names);
                $givenName = implode(" ", $names);
                $award['recipientName'] = $familyName . ', ' . $givenName;
            }
        }
        return $sentAwards;
    }

    /** Get enabled award types */
    static function getEnabledAwardTypes()
    {
        return self::$DAO->getEnabledAwardTypes(self::$contextId);
    }

    /** Get list of possible recipients */
    static function getRecipients()
    {
        $recipientList = array();
        // Get list of Tsugi learners in the context
        $tsugiUsers = self::$commonDAO->getContextUsers(self::$contextId);

        // Check for roster
        if (CommonService::$hasRoster) {
            // If there is a roster, learner list will be populated from it (such as when launched from LMS)
            foreach (CommonService::$rosterData as $learner) {
                if ($learner["role"] == 'Learner') {
                    $index = array_search($learner['user_id'], array_column($tsugiUsers, 'user_key'));
                    if (isset($tsugiUsers[$index]['user_id']) && $tsugiUsers[$index]['user_id'] != self::$user->id) {
                        $user = array(
                            'userId' => $tsugiUsers[$index]['user_id'],
                            'givenName' => $learner["person_name_given"],
                            'familyName' => $learner["person_name_family"],
                        );
                        array_push($recipientList, $user);
                    }
                }
            }
        } else {
            // If no roster, just return the list of Tsugi learners
            foreach ($tsugiUsers as $tsugiUser) {
                if ($tsugiUser["role"] == 0 && $tsugiUser['user_id'] != self::$user->id && isset($tsugiUser['displayname'])) {
                    $names = explode(" ", $tsugiUser['displayname']);
                    if (count($names) > 1) {
                        $familyName = array_pop($names);
                        $givenName = implode(" ", $names);
                    } else {
                        $familyName = $tsugiUser['displayname'];
                        $givenName = "";
                    }
                    $user = array(
                        'userId' => $tsugiUser['user_id'],
                        'givenName' => $givenName,
                        'familyName' => $familyName,
                    );
                    array_push($recipientList, $user);
                }
            }
        }
        return $recipientList;
    }

    /** Get enabled award types */
    static function getLeaderboard()
    {
        $config = self::getContextConfiguration();
        if ($config['leaderboard_enabled']) {
            // 5 for now, can be configurable if needed
            $leaders = self::$DAO->getLeaderboardLeaders(self::$contextId, 5);
            // Then loop over leaders and get their awards
            foreach ($leaders as &$leader) {
                if (!$config['anonymous_enabled']) {
                    $names = explode(" ", $leader['displayname']);
                    if (count($names) > 1) {
                        $leader['familyName'] = array_pop($names);
                        $leader['givenName'] = implode(" ", $names);
                        $leader['lastFirst'] = $leader['familyName'] . ', ' . $leader['givenName'];
                    } else {
                        $leader['familyName'] = $leader['displayname'];
                        $leader['givenName'] = "";
                    }
                }
                $leader['awards'] = self::$DAO->getReceivedApprovedCourseAwards($leader['userId'], self::$contextId);
            }
            return $leaders;
        } else {
            return array();
        }
    }
}
LearnerCtr::init();
