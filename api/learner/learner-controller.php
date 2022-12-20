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
            $config['recipient_view_enabled'] = $config['recipient_view_enabled'] ? true : false;
            // Optional
            // awarded_cooldown null
            // awarded_limit null
            // awarded_value "1"
            // received_cooldown null
            // received_limit null
            // received_value "2"
            return $config;
        } else {
            return null;
        }
    }

    /** Add an award for a learner */
    static function addAward($data)
    {
        global $CONTEXT;
        // Check config to see if moderation is required. If so, auto-moderation should be false
        $config = self::$DAO->getContextConfiguration(self::$contextId);
        if ($config['moderation_enabled'] == 1) {
            $awardStatus = "SUBMITTED";
        } else {
            $awardStatus = "ACCEPTED";
        }
        $res = self::$DAO->addAward(self::$contextId, self::$linkId, self::$user->id, $data['recipientId'], $data['awardTypeId'], $data['comment'], $awardStatus);
        $type = self::$DAO->getAwardType($data['awardTypeId']);

        // Email any instructors with notifications not turned off
        $subject = "New Shoutout sent in " . $CONTEXT->title;

        // Not sending email to sender, commenting out for now in case it is requested...
        // $personalMsg = "Your Shoutout has been submitted.\n\nCourse: " . $CONTEXT->title . "\nRecipient: " . $data['recipientId'] . "\nRequest Type: " . $type['label'] . "\nYour Comment: " . ($data['comment']);
        // CommonService::sendEmailToActiveUser($subject, $personalMsg);

        // Need to find recipient name here, for use in all emails
        $recipientName = null;
        $recipientEmail = null;
        if (CommonService::$hasRoster) {
            // If there is a roster, recipientId is the person_sourcedid from roster
            foreach (CommonService::$rosterData as $learner) {
                if ($data['recipientId'] == $learner['person_sourcedid']) {
                    $recipientName = $learner['person_name_full'];
                    $recipientEmail = $learner['person_contact_email_primary'];
                }
            }
        } else {
            // If no roster, recipientId is Tsugi user_id
            $res = CommonService::getUserContactByTsugiId($data['recipientId']);
            $recipientName = $res['displayname'];
            $recipientEmail = $res['email'];
        }

        // Send email to instructor IF they have that configuration
        $messageContent = "A new Shoutout has been submitted.\n\nCourse: " . $CONTEXT->title . "\nRecipient: " . $recipientName . "\nSender: " . self::$user->displayname . "\nShoutout Type: " . $type['label'];
        if ($data['comment']) {
            $messageContent = $messageContent . "\nSender Comment: " . $data['comment'];
        }
        if (CommonService::$hasRoster) {
            // If there is a roster, check notifications settings for each
            foreach (CommonService::$rosterData as $rosterPerson) {
                if ($rosterPerson["roles"] == 'Instructor') {
                    // Check first to see if notifications are turned off.
                    $instructor = CommonService::getUserContactByRosterId($rosterPerson['user_id']);
                    // Must clear out option each time
                    $option = null;
                    if (isset($instructor['user_id'])) {
                        $option = self::$DAO->getInstructorNotificationOption($instructor['user_id'], $config['configuration_id']);
                    }
                    if (!isset($option['notifications_pref']) || $option['notifications_pref'] == true) {
                        CommonService::sendEmailFromActiveUser($rosterPerson['person_name_full'], $rosterPerson['person_contact_email_primary'], $subject, $messageContent);
                    }
                }
            }
        } else {
            // If no roster, simply determine notification preference based on the userId on the instructor that created the settings
            $instructor = self::$commonDAO->getUserContact($config['user_id']);
            $option = self::$DAO->getInstructorNotificationOption($instructor['user_id'], $config['configuration_id']);
            // Check first to see if notifications are turned off.
            if (!isset($option['notifications_pref']) || $option['notifications_pref'] == true) {
                CommonService::sendEmailFromActiveUser($instructor['displayname'], $instructor['email'], $subject, $messageContent);
            }
        }

        if ($awardStatus == 'ACCEPTED') {
            self::sendApprovalEmailToRecipient($recipientName, $recipientEmail, $data['awardTypeId'], $data['comment'], $config['anonymous_enabled']);
        }
        return $res;
    }

    static function sendApprovalEmailToRecipient($recipientName, $recipientEmail, $typeId, $comment, $anonymous)
    {
        global $CONTEXT;
        $subject = "You received a Shoutout in " . $CONTEXT->title;
        $type = self::$DAO->getAwardType($typeId);
        // If not anonymous, need to find sender information (based on award senderId) and award comment
        $messageContent = "Congrats! You received a Shoutout!\n\nCourse: {$CONTEXT->title}\nShoutout Type: {$type['label']}";
        if (!$anonymous) {
            $senderName = self::$user->displayname;
            $messageContent = $messageContent . "\nSender: {$senderName}";
            if ($comment) {
                $messageContent = $messageContent . "\nComment: {$comment}";
            }
        }
        CommonService::sendEmailFromActiveUser($recipientName, $recipientEmail, $subject, $messageContent);
    }

    /** Get received awards */
    static function getReceivedApprovedCourseAwards()
    {
        $config = self::getContextConfiguration();
        $recipientId = 0;
        // Roster condition
        if (CommonService::$hasRoster) {
            // If there is a roster, learner list will be populated from it (such as when launched from LMS)
            foreach (CommonService::$rosterData as $learner) {
                if ($learner["role"] == 'Learner' && self::$user->key == $learner['user_id']) {
                    $recipientId = $learner['person_sourcedid'];
                }
            }
        } else {
            $recipientId = self::$user->id;
        }

        $res = self::$DAO->getReceivedApprovedCourseAwards($recipientId, self::$contextId);
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

        // If there is a roster, displayname here will be null as it couldn't be looked up
        if (CommonService::$hasRoster) {
            // If there is a roster, learner displayName will be populated from it (such as when launched from LMS)
            foreach (CommonService::$rosterData as $learner) {
                foreach ($sentAwards as &$request) {
                    if ($learner["role"] == 'Learner' && isset($request['recipientId']) && $request['recipientId'] == $learner['person_sourcedid']) {
                        $request['recipientName'] = $learner["person_name_given"] . ' ' . $learner["person_name_family"];
                    }
                }
            }
        }

        foreach ($sentAwards as &$award) {
            if (isset($award['approved']) && $award['approved'] == 0) {
                $award['approved'] = false;
            } else {
                $award['approved'] = true;
            }
            if ($award['senderName']) {
                $names = explode(" ", $award['senderName']);
                if (count($names) > 1) {
                    $familyName = array_pop($names);
                    $givenName = implode(" ", $names);
                    $award['senderName'] = $familyName . ', ' . $givenName;
                }
            }
            if ($award['recipientName']) {
                $names = explode(" ", $award['recipientName']);
                if (count($names) > 1) {
                    $familyName = array_pop($names);
                    $givenName = implode(" ", $names);
                    $award['recipientName'] = $familyName . ', ' . $givenName;
                }
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
                if ($learner["role"] == 'Learner' && self::$user->key != $learner['user_id']) {
                    // Using the user email instead of user_id
                    $user = array(
                        'userId' => null,
                        'givenName' => $learner["person_name_given"],
                        'familyName' => $learner["person_name_family"],
                        'lastFirst' => $learner["person_name_family"] . ', ' . $learner["person_name_given"],
                        'recipientId' => $learner["person_sourcedid"]
                    );
                    array_push($recipientList, $user);
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
                        'lastFirst' => $familyName . ', ' . $givenName,
                        'recipientId' => $tsugiUser['user_id']
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
                if (CommonService::$hasRoster) {
                    // If there is a roster, learner list will be populated from it (such as when launched from LMS)
                    foreach (CommonService::$rosterData as $learner) {
                        if ($learner["role"] == 'Learner' && isset($leader['recipient_id']) && $leader['recipient_id'] == $learner['person_sourcedid']) {
                            $leader['familyName'] = $learner["person_name_family"];
                            $leader['givenName'] = $learner["person_name_given"];
                            $leader['lastFirst'] = $learner["person_name_family"] . ', ' . $learner["person_name_given"];
                        }
                    }
                }
                $leader['awards'] = self::$DAO->getReceivedApprovedCourseAwards($leader['recipient_id'], self::$contextId);
            }
            return $leaders;
        } else {
            return array();
        }
    }
}
LearnerCtr::init();
