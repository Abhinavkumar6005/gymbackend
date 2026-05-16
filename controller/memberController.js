const Member = require('../models/Member');

const getAllMembers = async (req, res) => {
  
  try {
    const members = await Member.find().populate('membershipPlan');
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const createMember = async (req, res) => {
//   try {
//     console.log("----", req.body);
//     const member = new Member(req.body);
//     await member.save();
//     res.status(201).json(member);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

const createMember = async (req, res) => {
  try {
    const member = new Member({
      ...req.body,
      fullName: req.body.fullName || req.body.name,
    });
    await member.save();
    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteMember = async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const getExpiringMembers = async (req, res) => {
//   try {
//     const nextWeek = new Date();
//     nextWeek.setDate(nextWeek.getDate() + 7);
//     const members = await Member.find({
//       membershipEnd: { $lte: nextWeek, $gte: new Date() },
//       status: 'active'
//     }).populate('membershipPlan');
//     res.json(members);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


const getExpiringMembers = async (req, res) => {
  try {
    const today = new Date();
    const fiveDaysLater = new Date();
    fiveDaysLater.setDate(today.getDate() + 5);
    
    // Set to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    fiveDaysLater.setHours(23, 59, 59, 999);
    
    // Find members whose membership ends within next 5 days
    const expiringMembers = await Member.find({
      membershipEnd: {
        $gte: today,        // Membership ends today or later
        $lte: fiveDaysLater // But within the next 5 days
      },
      status: { $in: ['active', 'pending'] } // Only active or pending members
    })
    .populate('membershipPlan', 'name price durationMonths')
    .select('fullName email phone membershipPlan membershipEnd status amountPaid remainingAmount')
    .sort({ membershipEnd: 1 }); // Sort by soonest expiring first
    
    // Calculate exact days remaining for each member
    const membersWithDetails = expiringMembers.map(member => {
      const memberObj = member.toObject();
      const endDate = new Date(member.membershipEnd);
      const daysRemaining = Math.ceil(
        (endDate - new Date()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        ...memberObj,
        daysRemaining,
        expiryDate: member.membershipEnd,
        needsUrgentRenewal: daysRemaining <= 2,
        needsRenewal: daysRemaining <= 5
      };
    });
    
    res.status(200).json({
      success: true,
      count: membersWithDetails.length,
      message: membersWithDetails.length === 0 
        ? "No members expiring in the next 5 days"
        : `${membersWithDetails.length} member(s) expiring in the next 5 days`,
      data: membersWithDetails
    });
    
  } catch (error) {
    console.error('Error in getExpiringMembers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching expiring members', 
      error: error.message 
    });
  }
};

module.exports = { getAllMembers, createMember, updateMember, deleteMember, getExpiringMembers };