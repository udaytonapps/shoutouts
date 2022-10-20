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

    /** Add an award for a learner */
    static function addAward($data)
    {
        // Check config to see if moderation is required. If so, auto-moderation should be false
        $config = self::$DAO->getConfiguration(self::$contextId);
        if (isset($config['moderation_enabled']) && $config['moderation_enabled'] == 1) {
            $autoApproved = 0;
        } else {
            $autoApproved = 1;
        }
        return self::$DAO->addAward(self::$contextId, self::$linkId, self::$user->id, $data['recipientId'], $data['awardTypeId'], $data['comment'], $autoApproved);
    }

    /** Get received awards */
    static function getReceivedApprovedCourseAwards()
    {
        // Instructor can call learner DAO, but not the other way around
        return self::$DAO->getReceivedApprovedCourseAwards(self::$user->id, self::$contextId);
    }

    /** Get enabled award types */
    static function getEnabledAwardTypes()
    {
        // Instructor can call learner DAO, but not the other way around
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
                if ($tsugiUser['user_id'] != self::$user->id) {
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
}
LearnerCtr::init();
