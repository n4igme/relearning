const Course = require('../models/Course');
const Quest = require('../models/Quest');

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Mentor/Admin
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      thumbnail,
      content,
      price,
      tags
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const courseData = {
      title,
      description,
      category,
      difficulty,
      thumbnail,
      content,
      price: {
        amount: price.amount,
        currency: price.currency || 'USD',
        proposedBy: req.user.id
      },
      tags,
      creator: req.user.id,
      mentors: [req.user.id]
    };

    // Admin courses are auto-approved
    if (req.user.role === 'admin') {
      courseData.approvalStatus = 'approved';
      courseData.priceApprovalStatus = 'approved';
      courseData.approvedBy = req.user.id;
      courseData.approvedAt = Date.now();
      courseData.isPublished = true;
    } else {
      // Mentor courses need approval
      courseData.approvalStatus = 'pending';
      courseData.priceApprovalStatus = 'pending';
    }

    const course = await Course.create(courseData);

    // Add to user's created courses
    req.user.createdCourses.push(course._id);
    await req.user.save();

    res.status(201).json({
      success: true,
      message: req.user.role === 'admin'
        ? 'Course created and published successfully'
        : 'Course created and submitted for approval',
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getAllCourses = async (req, res) => {
  try {
    const {
      category,
      difficulty,
      search,
      sortBy = '-createdAt',
      page = 1,
      limit = 10
    } = req.query;

    const query = { approvalStatus: 'approved', isPublished: true };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$text = { $search: search };
    }

    const courses = await Course.find(query)
      .populate('creator', 'name avatar')
      .select('-content') // Don't send full content in list
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('creator', 'name email avatar bio')
      .populate('mentors', 'name avatar')
      .populate('quests');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Only allow viewing approved courses or creator's own courses
    if (course.approvalStatus !== 'approved' &&
        (!req.user || (req.user.id !== course.creator._id.toString() && req.user.role !== 'admin'))) {
      return res.status(403).json({
        success: false,
        message: 'This course is not yet published'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Creator/Admin
exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    const {
      title,
      description,
      category,
      difficulty,
      thumbnail,
      content,
      price,
      tags
    } = req.body;

    // Update fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (difficulty) course.difficulty = difficulty;
    if (thumbnail) course.thumbnail = thumbnail;
    if (content) course.content = content;
    if (tags) course.tags = tags;

    // If price is updated, require re-approval for mentors
    if (price && price.amount !== course.price.amount) {
      course.price.amount = price.amount;
      course.price.currency = price.currency || course.price.currency;
      course.price.proposedBy = req.user.id;

      if (req.user.role !== 'admin') {
        course.priceApprovalStatus = 'pending';
      }
    }

    // If major content changes, require re-approval for mentors
    if ((title || description || content) && req.user.role !== 'admin' && course.approvalStatus === 'approved') {
      course.approvalStatus = 'pending';
      course.isPublished = false;
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Creator/Admin
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get mentor's courses
// @route   GET /api/courses/mentor/my-courses
// @access  Private/Mentor
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ creator: req.user.id })
      .populate('quests')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add material (bab) to course
// @route   POST /api/courses/:id/materials
// @access  Private/Creator/Admin
exports.addMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    const { title, description, order } = req.body;

    if (!title || order === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Title and order are required'
      });
    }

    const material = {
      title,
      description,
      order,
      subMaterials: []
    };

    course.materials.push(material);
    await course.save();

    // Get the newly added material
    const addedMaterial = course.materials[course.materials.length - 1];

    res.status(201).json({
      success: true,
      message: 'Material added successfully',
      data: addedMaterial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update material (bab)
// @route   PUT /api/courses/:courseId/materials/:materialId
// @access  Private/Creator/Admin
exports.updateMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    const material = course.materials.find(m => m._id.toString() === req.params.materialId);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    const { title, description, order } = req.body;

    if (title) material.title = title;
    if (description) material.description = description;
    if (order !== undefined) material.order = order;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Material updated successfully',
      data: material
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete material (bab)
// @route   DELETE /api/courses/:courseId/materials/:materialId
// @access  Private/Creator/Admin
exports.deleteMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    course.materials = course.materials.filter(
      m => m._id.toString() !== req.params.materialId
    );

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add sub-material (sub-bab) to material
// @route   POST /api/courses/:courseId/materials/:materialId/sub-materials
// @access  Private/Creator/Admin
exports.addSubMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    const material = course.materials.find(m => m._id.toString() === req.params.materialId);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    const { title, type, content, url, duration, order } = req.body;

    if (!title || !type || order === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Title, type, and order are required'
      });
    }

    if (!['video', 'article', 'resource'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be one of: video, article, resource'
      });
    }

    const subMaterial = {
      title,
      type,
      content,
      url,
      duration,
      order
    };

    material.subMaterials.push(subMaterial);
    await course.save();

    // Get the newly added sub-material
    const addedSubMaterial = material.subMaterials[material.subMaterials.length - 1];

    res.status(201).json({
      success: true,
      message: 'Sub-material added successfully',
      data: addedSubMaterial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update sub-material (sub-bab)
// @route   PUT /api/courses/:courseId/materials/:materialId/sub-materials/:subMaterialId
// @access  Private/Creator/Admin
exports.updateSubMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    const material = course.materials.find(m => m._id.toString() === req.params.materialId);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    const subMaterial = material.subMaterials.find(
      sm => sm._id.toString() === req.params.subMaterialId
    );

    if (!subMaterial) {
      return res.status(404).json({
        success: false,
        message: 'Sub-material not found'
      });
    }

    const { title, type, content, url, duration, order } = req.body;

    if (title) subMaterial.title = title;
    if (type) {
      if (!['video', 'article', 'resource'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be one of: video, article, resource'
        });
      }
      subMaterial.type = type;
    }
    if (content) subMaterial.content = content;
    if (url) subMaterial.url = url;
    if (duration) subMaterial.duration = duration;
    if (order !== undefined) subMaterial.order = order;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Sub-material updated successfully',
      data: subMaterial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete sub-material (sub-bab)
// @route   DELETE /api/courses/:courseId/materials/:materialId/sub-materials/:subMaterialId
// @access  Private/Creator/Admin
exports.deleteSubMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    const material = course.materials.find(m => m._id.toString() === req.params.materialId);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    material.subMaterials = material.subMaterials.filter(
      sm => sm._id.toString() !== req.params.subMaterialId
    );

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Sub-material deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
